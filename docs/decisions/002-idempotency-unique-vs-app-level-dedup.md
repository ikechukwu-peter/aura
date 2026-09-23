# 002 — Idempotency enforced by a DB UNIQUE, not an application Set

## Context

A user on a flaky 4G connection will tap "Buy" four times. The browser's fetch layer will retry POSTs on 5xx. A future mobile app will retry on TCP reset. If the first request committed a reservation successfully and any of those retries hit a *different* backend pod, the app now has two committed reservations for the same single buyer intent.

Dedup needs to work across pods and across pod restarts, because a retry reaching a different pod is exactly the scenario we are defending against.

## Options

**A. Application-level in-memory Set per pod.** A `new Set()` keyed by idempotency key, checked before hitting the database. Zero schema cost. Fails immediately when the retry hits a different pod — and that is the case that matters. Also empty after any restart or deploy. Can be extended to a Redis global Set with a TTL, but then you're adding Redis for correctness and Redis now has to be up for writes.

**B. Write to the reservation table with `ON CONFLICT DO NOTHING` and check idempotency after.** Short version: `INSERT ... ON CONFLICT (idempotencyKey) DO NOTHING RETURNING *`, with no pre-read. If RETURNING is empty, fetch the existing row. Works — but the idempotency read happens *after* the capacity CAS, which means a retried request still pays to serialize on the hot event row and do the CAS dance. Then you throw away the work (or worse, if the CAS happened *after* someone else had that seat, you'd reserve it twice). Idempotency has to be the *first* check in the transaction, before the CAS.

**C. Pre-read with a DB-enforced UNIQUE (`Reservation.idempotencyKey String @unique`) and return the existing row on hit.** Idempotency is the first statement inside the same `$transaction` as the CAS; on a hit, we skip CAS + reservation insert and return the stored reservation. The UNIQUE constraint is schema-level, not ORM-level, so a direct INSERT from anywhere else still gets `23505 unique_violation` instead of silently succeeding. Correctness is independent of which pod runs the request, which ORM we use, or whether we do a redeploy mid-sale.

## Decision

Option C.

- Correctness is schema-enforced, not code-convention-enforced: a rogue INSERT, a bulk migration, or a refactor that drops the `findUnique` check still cannot write two reservations with the same key because Postgres itself refuses.
- Idempotency is checked *before* the CAS write, so retried requests do not add to the hot-row write contention on the event. That's a genuine capacity win under retry storms.
- No Redis. No in-memory state per pod. Deploy and forget.

Implemented at [ticketing.ts L19-L23](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L18-L24) inside [TicketingService.reserveTickets](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L10-L75); the schema constraint is [Reservation.idempotencyKey @unique](file:///Users/Apple/workspace/personal/aura/prisma/schema.prisma#L98-L109) in `prisma/schema.prisma`.

## Consequences

- **Client must generate and persist the key.** `idempotencyKey` is generated client-side (UUID v4), not server-side — if the server generated it, the client could never repeat it on a retry when it doesn't know whether the first request landed. The checkout page owns the key's lifetime.
- **Keys are not cleaned up.** `Reservation` rows are permanent, so the UNIQUE index just grows. At millions of completed reservations this adds ~32 bytes per key plus index overhead. Acceptable for v1; a later pass can drop the UNIQUE and rely on a 24-hour TTL partial index, or partition reservations by month. Revisit if/when reservation rows exceed 10M.
- **Idempotency keys are shared across events.** Nothing in the schema scopes a key to an event. A client could theoretically reuse one key for two different events and have the second silently return the first reservation — never do that. The checkout page in `src/app/checkout/[id]/page.tsx` generates one fresh UUID per *intent*, never per page load. Future work could make the unique `(userId, idempotencyKey)` to narrow blast radius.
