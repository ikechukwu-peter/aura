# 006 — JWT in an httpOnly cookie over an opaque session table

## Context

We need a login session: after a user submits their password, subsequent requests need to (a) identify who they are, (b) know their role, and (c) resist obvious forgery / theft / replay. Two standard choices are JWT signed tokens vs opaque random session ids looked up against a DB table. Both are acceptable; the trade-offs are operational.

## Options

**A. Stateless JWT in httpOnly SameSite=Lax cookie.** A small HS256 JWT carries `{ userId, role, expiresAt }`. The signature is verified with `jose.jwtVerify` on every read. The cookie is `httpOnly: true` (JS cannot read it, so XSS cannot exfiltrate the token), `SameSite: lax`, and `Secure` in production. No DB round-trip needed to know who the caller is; horizontal scaling of app servers is trivial because there's no session state to share.

**B. Opaque session id + Postgres `Session` table + index.** Login writes a (sessionId, userId, expiresAt) row to a Session table. The cookie holds only the opaque 32-byte random id. Every server action and route does `SELECT * FROM session WHERE id = ? JOIN user ...` before running. Revocation is immediate: `DELETE FROM session WHERE id = ?` or soft-delete the row.

**C. Hybrid.** JWT for the 10-minute hot path, plus a sessions table consulted at JWT expiry boundaries, or on every `ADMIN`/`SUPER_ADMIN` role write. This is the most correct for production but also the most code — two session paths, two expiry semantics.

## Decision

Option A. Portfolio priority: the interesting thing to demonstrate is the 4-tier ticketing defense, not session revocation.

- `httpOnly; SameSite=Lax; Secure` gives the same theft resistance as an opaque session id (both are just opaque cookies to JS). The signing key is what turns the JWT from "attacker writes any userId" into "only the server can issue one" — a property identical to the attacker not being able to guess the opaque id.
- Zero reads on the session table per request. Every single "fetch events / render dashboard" page skips a DB hop.
- Session tokens are short-lived: 2 hours in [createSession](file:///Users/Apple/workspace/personal/aura/src/lib/auth.ts#L33-L45). For a ticketing product, revocation before expiry is a nice-to-have, not a must-have — if an account is compromised, the `isBlocked` flag on `User` is checked on every mutating action by the server action role checks, so a stale JWT for a blocked account can view pages but not buy, transfer, or check in.

Implemented in [src/lib/auth.ts](file:///Users/Apple/workspace/personal/aura/src/lib/auth.ts#L1-L57) (`encrypt`/`decrypt`/`createSession`/`getSession`/`deleteSession`), with JWT_SECRET from `.sample.env` [.sample.env L1-L10](file:///Users/Apple/workspace/personal/aura/.sample.env#L1-L10) and SESSION_COOKIE_NAME for the cookie key name so multiple Aura deployments on the same eTLD+1 don't clobber each other.

## Consequences

- **Immediate revocation before the 2h expiry is not possible by default.** The only "immediate revoke" is password-reset style: change `JWT_SECRET`, which logs every single user out, or use a short-enough TTL (2h) that the worst-case stolen-session window is acceptable. For a bank-style product this is the wrong call; for a ticketing portfolio piece with `User.isBlocked` checked on writes, it is the right cost/benefit.
- **`JWT_SECRET` is the key to the kingdom.** Leak it and attackers can mint JWTs for any userId, including `SUPER_ADMIN` role, and can forge QR tickets (separate key: `TICKET_SECRET` is distinct). Operational requirement: secret is generated at 256 bits, never committed, never logged, rotated only via a documented procedure (during rotation, support dual-key verify briefly for the overlap window).
- **Role changes lag until JWT expiry by 2 hours max.** If admin promotes `USER` to `ORGANIZER`, the user keeps their old role JWT until the cookie expires. Mitigation: for actions gated on role, re-read `user.role` from the User table at action time rather than relying only on `session.role`. The current code already does this for the resource-ownership checks (`user either owns the resource or is ADMIN+`), so role drift only affects who *sees* the admin UI shell, not who can actually mutate. Closing the last gap (re-reading role on every role-gated mutation) is a before-production TODO.
- **`SESSION_COOKIE_NAME` must be overridden in multi-instance dev.** Running Aura twice on the same localhost domain on different ports with the default cookie name logs you out of the first when you log into the second.
