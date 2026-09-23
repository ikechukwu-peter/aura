# Aura ticketing protocol v1

Supersedes the short architecture notes previously in this file. Full narrative: [CASE_STUDY.md](CASE_STUDY.md). Per-decision rationale: [decisions/](decisions/). Architecture diagram source: [archify.yaml](archify.yaml).

One event. Four roles. Correctness is enforced by Postgres, not by trust in the UI.

```prisma
enum UserRole { USER  ORGANIZER  ADMIN  SUPER_ADMIN }
```

## Ticket lifecycle

```text
Available seat
    │
    ▼  reserve(userId, eventId, quantity, idempotencyKey)
    │    └ Tier 1:  CAS UPDATE Event WHERE ticketsIssuedCount <= capacity - N
    │    └ Tier 2:  Reservation.idempotencyKey UNIQUE  →  retries return existing
    │    └ Tier 3:  hold counted against capacity for 10 minutes
    ▼
Held (Reservation ACTIVE, expiresAt = now + 10 min)
    │
    ├──────── TTL worker sweeps every run; expired → RESERVATION_EXPIRED ──► Released
    │         decrement ticketsIssuedCount atomically
    │
    ▼  confirm(reservationId, userId)   [payment succeeds]
    │    └ ticketIndex UNIQUE(userId, eventId, ticketIndex)
    │    └ qrPayload = signed JWT { ticketId, ticketCode, eventId, userId }
    │    └ Tier 4:  reconcileCapacity() self-heals drift after every sweep
    ▼
Issued (Ticket ISSUED)
    │
    ├────────── scan(userId, {qrToken}) ──────────────────────────────► Used   (USED)
    │            ├ invalid signature  →  reject (no DB call)
    │            ├ already scanned    →  reject (status guard)
    │            ├ not owner's event  →  reject (role + ownership guard)
    │            └ write AuditLog TICKET_SCANNED
    │
    └────────── cancel(userId, ticketId) ─────────────────────────────► Cancelled (CANCELLED)
               ADMIN+ only; capacity reverted; AuditLog entry
```

## Happy path

```text
User                                    Postgres
────────                                ────────
POST reserve(idemKey, N)  ────────────►
                                          findUnique Reservation idemKey  (Tier 2)
                                          IF NOT EXISTS:
                                            Event UPDATE ... WHERE sold <= cap - N (Tier 1)
                                            Reservation ACTIVE expires now+10m
                                            AuditLog RESERVATION_CREATED
◄──────── 201 { reservationId, expiresAt }

Payment provider (outside this protocol) succeeds:

POST confirm(reservationId) ───────────►
                                          findUnique reservation
                                          assert ACTIVE and userId match and not expired
                                          for i in 0..N-1:
                                            Ticket create(ticketIndex=next+i, ...)
                                            sign QR payload → qrPayload
                                          Reservation → CONVERTED
                                          AuditLog TICKETS_ISSUED
◄──────── 201 [{ qrPayload, ticketCode, ticketIndex }]

At the door:

POST /api/organizer/checkin(qrToken) ──►
                                          verifyTicketToken(qrToken)  [local, HMAC]
                                          findUnique Ticket
                                          assert ISSUED, event match
                                          Ticket → USED, validatedAt/By
                                          AuditLog TICKET_SCANNED
◄──────── 200 { ok, ticketCode, seat, ownerName }
```

## Resume / idempotency path

- Same `idempotencyKey` on a second or twentieth `reserve` call returns the same `Reservation` row already created. Tier 2 is enforced by the schema's `@unique`, so even two pods, two requests, zero coordination cannot write two reservation rows for the same key.
- Expired-hold decrement is idempotent: `handleExpiredReservation` first verifies the reservation is **still ACTIVE** before decrementing. Running the TTL worker twice concurrently (or twice in the same sweep) on the same expired id does not double-decrement.
- `reconcileCapacity()` sums active reservations + issued tickets independently, compares against `event.ticketsIssuedCount`, and writes a corrective UPDATE on mismatch, plus an `AuditLog CAPACITY_RECONCILED`. This catches any drift that a future code path (manual DB change, mid-sale admin action, new mutation path that forgot the counter bump) introduced.

## Failure paths

| Situation | Message / outcome | Who reacts |
| --- | --- | --- |
| CAS predicate fails (`ticketsIssuedCount + N > capacity`) | `Not enough tickets available or event closed`, Reservation not created | User gets shown sold-out or retry UI; no partial write |
| Idempotency key already exists | Returns the existing reservation; no CAS write, no new hold | Client proceeds to checkout of the same hold |
| `Ticket.(userId, eventId, ticketIndex)` UNIQUE violation | Insert throws `23505 unique_violation`; tx aborts; no new ticket created | Tier 3 defense catches bugs/refactors that otherwise double-assign a seat |
| Confirm arrives after 10-minute expiry | Reservation state is no longer ACTIVE → `handleExpiredReservation` runs lazily, throws "Reservation has expired" | User must start over; capacity was already reverted |
| QR signature fails verification | Forgery detected offline, reject, 0 DB round-trip | Door scanner denies entry immediately |
| Scan arrives for an already-USED ticket | Status guard rejects "Already scanned" | Second door shows an error; first scan wins |
| Two transfers claim the same ticket | TicketTransfer.transferCode UNIQUE + Ticket ownership guarded in one tx | Second claim fails atomically |

## Rules

1. **`event.ticketsIssuedCount` is authoritative, not derived.** Any count of Ticket rows is stale the moment after the COUNT returns; any read that needs capacity uses the counter. The reconciler exists specifically to defend this rule.
2. **Never write a Ticket outside a `$transaction` that also does the CAS + idempotency check.** A standalone `prisma.ticket.create(...)` somewhere else in the code is a bug; Tier 1 and Tier 2 both miss it, and only Tier 3 (ticketIndex UNIQUE) saves you.
3. **A ticket is only "ACKed" once both its QR token has been signed and the AuditLog row is committed.** A confirm that signed tokens but crashed before writing AuditLog leaves the signed qrPayload on the Ticket row and is still valid — the reconciler cannot fix missing audit entries, so AuditLog write is inside the same tx.
4. **Ownership checks re-run server-side on every mutating action.** The UI hides buttons the caller cannot press; the server action does not trust that. ORGANIZER cannot edit another organizer's event even if they guess the eventId in the form body.
5. **Reconciler runs after *every* TTL sweep *and* on a 5-minute cron.** Drift never lasts longer than one sweep plus 5 minutes. Any CAPACITY_RECONCILED AuditLog entry is paging-worthy in production.
6. **AuditLog is append-only in application code.** No `prisma.auditLog.update(...)` or `.delete(...)` anywhere in the repo. In production add Postgres row-level security that enforces this for the application DB user, so even a direct DB console session with the application credentials cannot erase entries.

## Not in v1

- **Waitlist.** When capacity hits zero, `POST reserve` returns sold out. It does not add the user to a waitlist and auto-upgrade later.
- **Partial refunds.** Cancel a whole Ticket (ADMIN+) today; partial refund of a 4-ticket reservation requires separate tickets already (good) but no UI for keeping 2 and refunding 2.
- **Ticket resale marketplace (primary/secondary).** Transfers are person-to-person today and free; no payments, no fees, no organizer-configured resale caps.
- **Per-section pricing / tiered seats.** `Event.price` is one Float. Orchestra/Balcony/VIP sections, per-seat row-and-number assignment, and dynamic pricing hooks are not modelled.
- **Group-seat block assignment ("4 adjacent").** `ticketIndex` is a per-user ordinal today — any grouping is cosmetic in the UI. There is no constraint guaranteeing seat adjacency; to do this properly you'd model a `Seat` table per event with row/col and status.
