# 001 — CAS `UPDATE ... WHERE` over explicit row locks or distributed mutexes

## Context

A ticket write must do two things atomically: check that `sold + requested <= capacity`, then increment `sold`. Under flash-sale load (say 50,000 concurrent requests for the same 5,000-seat event) a naive read-then-write loses the race every time, so we need to eliminate that window somehow.

The correctness requirement is strict: two people must never get the same seat number, and we must never show "sold out" when seats are actually free.

## Options

**A. Pessimistic `SELECT ... FOR UPDATE` row lock.** Read the event row inside a transaction with `FOR UPDATE`, then run the check+update in two statements. The first in-flight transaction holds the lock; every other writer blocks until it commits. Behavior is predictable and linear. Downsides: the lock window is `SELECT + check + UPDATE + INSERT reservation + INSERT audit + commit`. On a contended row every request serializes through that window — throughput is roughly `1 / tx_duration`, and under high load the Postgres connection pool fills with waiting connections before any useful work is done. Deadlocks across two rows (event + reservation) are possible in naive ordering.

**B. Compare-and-Swap `UPDATE ... WHERE` in one statement.** The capacity predicate moves *into* the `WHERE` clause of the increment: `UPDATE event SET sold = sold + N WHERE id = $1 AND sold <= capacity - N`. If `updateMany` returns `count === 0`, this writer lost the race and throws immediately — no rows written, no compensation needed. Postgres still serializes the UPDATE on the tuple (so correctness is identical to row locks), but the write window is the *single statement*, not the whole transaction. Everything else (reservation insert, audit insert) happens after the CAS. Downsides: you can't reuse the fetched `event` row for the predicate because the read isn't atomic with the write; the predicate must live inside the UPDATE. Two-phase application code that first reads the row and *then* does the CAS is still racy.

**C. Distributed mutex at the application layer** (Redis Redlock, advisory locks, named Postgres locks). Mutex by `eventId` before even touching the database. Gives a clean application-side primitive and lets you serialize entire reservations. Downsides: adds a moving part (Redis or the advisory-lock surface) for a correctness benefit you already get for free inside Postgres. Failure modes are now "app dead + lock held" — even with TTLs, the TTL sets a floor on the longest possible stale hold, which is worse than Postgres's own timeout on a tuple lock. More complexity, more things to monitor, and — for this problem — zero correctness gain over the DB's own locking.

## Decision

Option B.

- The lock-holding window is *much* smaller than option A because the `UPDATE` is a single statement; the `Reservation` and `AuditLog` inserts happen after we've already released the tuple-level write serialization.
- No deadlock surface (two writers can't deadlock on the CAS; they just race to 0 rows or 1).
- No extra infra (ruling out C) keeps the correctness story pure: if Postgres is up, the correctness mechanism is up.
- The `count === 0` loss is a clean throw, no partial writes to roll back and no compensation saga.

Implemented in [TicketingService.reserveTickets](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L10-L75) as tier 1 of the 4-layer defense; the transaction is [prisma.$transaction](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L18-L74) wrapping idempotency check → CAS → reservation create → auditLog create.

## Consequences

- The CAS runs inside the Prisma client as `tx.event.update(...)`. The `catch` on L45 converts a Postgres 0-row-returned failure (which Prisma throws as `NotFoundError` in strict mode, or here as a predicate miss inside `update`) into a single user-facing "Not enough tickets available or event closed". Callers above must not silently retry on that error.
- Capacity numbers can only be changed atomically by the CAS, by the TTL-revert decrement in [handleExpiredReservation](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L164-L189), or by the reconciler on [reconcileCapacity](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L216-L266). Any manual UPDATE to `ticketsIssuedCount` from a DB console bypasses CAS; the reconciler will re-detect drift on the next 5-minute run and fix it, but an admin write during a live sale is a brief race window.
- Throughput ceiling on a single hot event is the Postgres tuple-update throughput for that row, not anything in the application layer. Raising it means PgBouncer → FIFO queue → shard counters — see [docs/capacity.md](capacity.md).
