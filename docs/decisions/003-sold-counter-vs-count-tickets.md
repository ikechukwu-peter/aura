# 003 — A stored `ticketsIssuedCount` counter over live `COUNT(ticket)` queries

## Context

Every CAS write needs a fast, consistent capacity number. Under flash-sale load we are not allowed to do a slow read, and we are especially not allowed to do a slow read *inside* the same transaction whose hot-row write is the whole scalability bottleneck.

The real "sold seats" value is the sum of active (non-expired) reservation quantities plus ISSUED or USED tickets. We could compute it that way every time, or we could store it once on the event row and treat the stored counter as authoritative.

## Options

**A. `COUNT(*)` derived on every read, no stored counter.** Every time we need sold we aggregate: `activeReservations SUM(quantity) + COUNT(tickets) WHERE status IN (ISSUED, USED)`. This is guaranteed correct by definition — no drift is even possible. But it's slow under load because ticket tables grow; with 1M tickets sold per event the COUNT is a nontrivial scan. Worse, the CAS statement itself would need to embed those aggregates, turning a 1-tuple UPDATE into a multi-table predicate. Dead on arrival for the hot-event case.

**B. Stored counter `event.ticketsIssuedCount` updated by every write path, with a self-healing reconciler.** Every increment is the CAS in [reserveTickets](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L35-L47); every decrement is the TTL revert in [handleExpiredReservation](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L176-L179); any drift is fixed by [reconcileCapacity](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L216-L266), which *does* do the full COUNT / SUM once per event and writes a single corrective UPDATE back. The reconciler runs after every TTL sweep and on a 5-minute cron, so drift never lasts longer than that plus one sweep. The CAS reads only one column from one row — ideal.

**C. Stored counter + Materialized View.** A Postgres MV that aggregates once and is REFRESHed CONCURRENTLY on a schedule. Reads get both a fast counter and a derived one to compare. Adds the operational weight of refresh scheduling, MV bloat, and CONCURRENTLY refreshes that can fail if they can't get their snapshot. For a single INT column per event, overkill.

## Decision

Option B.

- The CAS write path is exactly one single-tuple UPDATE. That's the fastest Postgres can write.
- Drift is possible (buggy code, a DB admin manually editing rows, a partial tx that somehow commits an INSERT without the counter bump, a TTL revert that's run twice) but drift is *detected and self-healed* within minutes by a background worker that also writes to the append-only AuditLog.
- The counter + reconciler pair is actually *provable by inspection*: if every path that claims a seat also increments `ticketsIssuedCount`, and every path that releases a seat also decrements it, then drift cannot occur. The reconciler is safety-net insurance for paths that don't yet exist.

The column lives at [Event.ticketsIssuedCount](file:///Users/Apple/workspace/personal/aura/prisma/schema.prisma#L56-L78).

## Consequences

- **Any new write path that touches seats must remember to bump the counter.** Organizer manually reducing capacity mid-event, admin cancelling a block of tickets, partial refunds — if they change the live set of sold seats, they must update `ticketsIssuedCount`. The reconciler *will* fix the drift, but between the new path and the next cron run there's a window where CAS is wrong. This is why tier 3 (`@@unique([userId, eventId, ticketIndex])`) exists as a catch-all.
- **Drift is an audit event.** Every corrective UPDATE writes a [CAPACITY_RECONCILED](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L250-L261) AuditLog row with old value, new value, and reason. In production you can monitor AuditLog for this action at > N per day and page. A clean month has exactly zero of these.
- **Read-heavy views (public event listings) use the counter directly.** `capacity - ticketsIssuedCount` is a single int subtraction and gives the current seats-available number shown to buyers. It can be stale by the reconciler drift bound (≤5 min + one sweep). For public landing "about 140 seats left" copy that's fine; for the CAS write itself it's authoritative.
