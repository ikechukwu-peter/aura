# Design decisions

One file per decision, e.g. `001-cas-vs-pessimistic-locking.md`:

- **Context:** what problem forced a choice
- **Options:** what was considered (A / B / C, with trade-offs)
- **Decision:** what was chosen and why
- **Consequences:** what it costs, what to revisit

## Index

- [001 — CAS `UPDATE ... WHERE` over explicit row locks or distributed mutexes](001-cas-vs-pessimistic-locking.md)
- [002 — Idempotency enforced by a DB UNIQUE, not an application Set](002-idempotency-unique-vs-app-level-dedup.md)
- [003 — A stored `ticketsIssuedCount` counter over live `COUNT(ticket)` queries](003-sold-counter-vs-count-tickets.md)
- [004 — Signed JWT QR tokens over random ticket codes](004-signed-qr-token-vs-random-code.md)
- [005 — Held reservations count against capacity during their 10-minute TTL](005-hold-counted-against-capacity-vs-optimistic.md)
- [006 — JWT in an httpOnly cookie over an opaque session table](006-jwt-cookie-vs-opaque-session-table.md)
