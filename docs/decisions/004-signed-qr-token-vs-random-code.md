# 004 — Signed JWT QR tokens over random ticket codes

## Context

The most common real-world ticket fraud vector is a photo of a valid ticket's QR code shared in a group chat. If the QR only encodes a random opaque ticket code like `ticketId: "abc123"`, anyone who sees someone else's ticket can copy it, print it, and try to walk in first.

Fraud prevention at the door needs to reject forgeries **before** it talks to the database. We will still do a DB write for the final "ticket consumed" mark, but the #1 real-world forgery class (printed photo) must be rejectable offline, with zero network round-trip — because venue Wi‑Fi / 4G at the door is unreliable and every 2 s delay during door rush is a longer queue.

## Options

**A. Random opaque code + DB lookup only.** The QR contains only a random 24-hex ticket code. The door scanner POSTs that code to the server to check it is real and unused. Simple to implement, no crypto. But 100 % of the correctness depends on door network connectivity; if Wi‑Fi is down you can't check anyone in. Worse: a forgery attempt is indistinguishable from a DB miss, so someone spraying 10,000 random strings through the door line is indistinguishable from 10,000 genuine tickets — you can't fail fast on obviously bad input.

**B. Symmetric HMAC-signed JWT with a ticket-scoped secret.** The QR encodes a compact JWT signed with a secret, carrying `ticketId`, `eventId`, `userId`, `ticketCode`, and a short expiry window. The door holds a copy of the ticket-scoped secret and verifies locally. A printed photo of a real ticket's QR is still a valid signature; what the signature catches is any forgery **not** signed by the backend (the far bigger class of "I pasted some bytes into a QR generator and printed it"). Forgery rejection = 0 DB hits, 0 network. Downsides: secret rotation immediately invalidates every unscanned ticket if done naively, and a stolen door tablet has the key and can forge tickets.

**C. Asymmetric Ed25519 signatures.** Door tablet only holds a public key; backend holds the private key. Benefit: a stolen door tablet **cannot** mint new tickets. Cost: signatures are longer (token-size/QR readability trade-off), and key management/rotation is an extra operational step. For a portfolio piece, "stolen door tablet" is not the #1 threat model we are exercising; the #1 threat model we do exercise is "printed photo forgery + offline verification" to match the protocol invariants we already reason about elsewhere.

## Decision

Option B, with a **ticket-signing secret strictly separated from the session JWT secret**.

- Works offline at the door: signature verify is pure HMAC, no network, and a forged QR fails before any DB lookup.
- Rejects photo/QR-generator forgeries instantly — the common case we explicitly care about — without loading the DB during rush.
- Token payloads fit in a standard QR code with compact JWT encoding.
- Rotating `TICKET_SECRET` and rotating `JWT_SECRET` are independent operational steps; leak of one does not expose the other.

QR token signing uses `TICKET_SECRET` (distinct from `JWT_SECRET` used for session cookies) in [src/lib/qr.ts](file:///Users/Apple/workspace/personal/aura/src/lib/qr.ts#L1-L33). Tokens are generated in `generateTicketToken` (L7‑L17) and verified in `verifyTicketToken` (L19‑L33). The signed qrPayload is attached to the ticket row at confirm time in [confirmReservation](file:///Users/Apple/workspace/personal/aura/src/services/ticketing.ts#L124-L136).

## Consequences

- **Secret rotation is a real operational step.** Rotating `TICKET_SECRET` immediately invalidates every ticket signed with the old key. The correct production playbook is to temporarily accept both old and new signatures during an overlap window (dual-sign / dual-verify). That playbook is not implemented in the repo; in production you write the playbook before you ever rotate the key. For a portfolio artifact where tickets are demo-scoped this is a documented limitation.
- **The door tablet can forge tickets,** because it holds a copy of the symmetric secret. This is strictly weaker than asymmetric Option C. When the threat model expands to "physical door tablet theft by insider" this ADR is revisited and C is picked. For the current threat model (printed photos, offline verify) B is the right cost/benefit.
- **Token size.** JWT size is small enough to scan reliably; longer payloads (seat numbers, row labels) would push us to shorter claims.
