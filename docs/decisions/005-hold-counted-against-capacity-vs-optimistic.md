# 005 — Held reservations count against capacity during their 10-minute TTL

## Context

A user needs a reasonable amount of time to enter payment details after selecting seats — otherwise as soon as someone loads the checkout, the seat they thought they had is taken by someone who got through Stripe a second faster. The checkout page is roughly 10 minutes of "realistic human payment time." Whether that held seat is subtracted from the capacity pool during the window, or whether we "optimistically" only claim it at payment time, is a user-visible and correctness-relevant decision.

## Options

**A. Held seats held against capacity during the TTL.** When the CAS increments `ticketsIssuedCount`, that count includes the reservation quantity, not just confirmed tickets. The TTL revert in [handleExpiredReservation](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L164-L189) decrements it back on expiry.

Upside: the promise the system makes to the user ("you have 10 minutes to complete this purchase") is actually a promise the system keeps. If you have a seat held, nobody else can buy it out from under you.

Downsides: a malicious buyer can hoard seats — 100 users × 100 seats held × 10 minutes = 10,000 seat-hours of denial, even though they never pay. The `ticketsPerUserLimit` guard limits the blast radius per account, but a determined attacker can spin up 100 accounts.

**B. Optimistic hold — seats only count against capacity on confirmation.** The reservation is created, `ticketsIssuedCount` is untouched, and at payment-confirm time we run the CAS again at that exact moment.

Upside: no seat-hoarding attack is possible because nothing is actually reserved. No TTL reversion code.

Downside: the user's held seat is *not* a held seat at all. Under flash-sale load, the CAS at confirm-time loses the race with very high probability, and the user gets "seats no longer available" after entering payment — a terrible user experience and a card-charge-then-refund anti-pattern if the payment was submitted in parallel before the CAS.

**C. Optimistic hold with short TTL (30 seconds).** Claim against capacity but for only 30 seconds; require a "keepalive" ping from the checkout page every 20 seconds to renew up to a hard 10-minute cap.

Upside: abandoned carts release seats almost immediately; attackers who hoard would have to send keepalives and therefore be easier to rate-limit.

Downsides: adds a background ping route, a second "renewal" write path, and harder testing (the keepalive timing window is a real state machine). If a user's mobile phone has spotty reception, their seats evaporate even though they were still genuinely filling in the form.

## Decision

Option A, with per-user seat cap `Event.ticketsPerUserLimit @default(5)` in the schema.

- The whole point of the TTL worker and the CAS-in-transaction design is that the seat promise is *real*. Option B silently breaks the promise. Any design that says "10-minute held seat" but actually runs the CAS at confirm is lying to the buyer.
- Seat hoarding is real, but the per-user cap (5 per user per event) and the ability for admins to ban account blocks and the `isBlocked` column in the `User` model contain it without needing the extra machinery of option C.
- The TTL revert is implemented atomically by decrementing the counter on expiry (option A wouldn't work without that — otherwise capacity would be permanently double-counted and lost once per expiry).

Implemented at [ticketing.ts L34-L57](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L34-L57) where the CAS and `Reservation.create` are inside the same transaction; revert at [ticketing.ts L164-L189](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L164-L189).

## Consequences

- **You cannot silently "drop reservations in place".** Because the counter was decremented by the CAS, releasing that reservation must also decrement it, or the event permanently appears to have sold N seats it didn't sell. Any future "voluntarily release held reservation" feature has to call the same decrement path, not just set the reservation state.
- **`ticketsPerUserLimit` is enforced at application write-time today, not at the DB layer.** The schema does not currently have a trigger that counts reservations per (userId, eventId) and rejects if > limit. The `ticketsPerUserLimit` column in the Event model exists but the enforcement in reserveTickets currently does not check it — a gap that needs closing before production.
- **Under a targeted seat-hoarding attack, the event appears sold out even though no tickets are actually paid.** The mitigation is, in order: (1) rate-limit new accounts under the same IP/device, (2) add `ticketsPerUserLimit` enforcement on the reserve path, (3) a short-TTL "hoard detection" job that flags accounts holding the maximum seats on many events. The reconciler alone does *not* help here because the drift-to-be-fixed does not exist — capacity was correctly decremented.
