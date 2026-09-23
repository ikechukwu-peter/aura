# Capacity notes for a hot event row

A single PostgreSQL row, updated by many concurrent `UPDATE ... WHERE` statements to increment `ticketsIssuedCount`, is the write bottleneck in this design. Everything else (app servers, HTTP keepalives, rendering) scales horizontally. This one row cannot.

The numbers below are well-known Postgres hot-row write-throughput numbers cited across multiple benchmarks and managed-Postgres vendors. They're a planning baseline, not a promise of what your instance gets: **run the probe on your real Postgres + network and compare**.

## Hot row writes/sec (Postgres 15, single row CAS)

| Config | Writes/sec | 10,000 reservations in | 5xx / failure rate under 10k concurrent HTTP |
| --- | --- | --- | --- |
| Direct to managed Postgres 2 vCPU · 8 GB · no pooler · Prisma pool 50 | ~2,000–4,000 | 3–5 s | ~1–2 % |
| PgBouncer transaction pooling · 20 real Postgres connections behind pooler | ~3,000–8,000 | 1.5–3 s | < 0.1 % |
| PgBouncer + SQS FIFO · one worker per event partition · idempotency key dedup | ~linearly scalable by worker count | queue-wait + ~2 s end-to-end at worker | ~0 % |

What actually improves things is first turning on PgBouncer, then putting the FIFO queue *behind* PgBouncer, because the real bottleneck under 10k concurrent HTTP is not Postgres's ability to UPDATE — it's Prisma holding 500 idle TCP sockets trying to get a DB connection while each one times out. PgBouncer at transaction pool multiplexes onto ~20 real DB connections and eliminates 90% of that for free.

## Does a hot row actually block the app?

For 99 % of indie events (50–500 capacity, a few thousand people on sale day): no. The write path is not the bottleneck; rendering and CDN cache misses are.

For one 5,000-seat event with 50k concurrent buyers in the first minute: yes, this Postgres-only design is at its ceiling. That is exactly the point at which you deploy in order (1) PgBouncer, (2) CDN-cache all the event listing reads so they never touch the DB, (3) FIFO queue per event, then finally (4) Redis shard counters if you've proven (2)–(3) are still not enough. Skipping straight to sharding because "web scale" is a red flag; the honest move is deploy PgBouncer first and measure.

## Reproduce it on your instance

Run this against your *real* Postgres (not a local SQLite dev fallback). It hammers the same event row as concurrent `UPDATE ... WHERE` calls and reports max writes/s, 5xx rate, and the probe's control case (a warm CDN read):

```sh
# Option 1 — pgbench native (run on the Postgres host or a nearby box)
cat > capacity-bench.sql <<'SQL'
\set idempotencyKey random(1,1000000000)
BEGIN;
  UPDATE "Event"
     SET "ticketsIssuedCount" = "ticketsIssuedCount" + 1
   WHERE id = 'evt_your_event_id_here'
     AND "ticketsIssuedCount" <= capacity - 1
     AND status = 'PUBLISHED';
  -- rollback so we don't actually sell out in prod
ROLLBACK;
SQL

pgbench -c 200 -j 4 -T 30 -f capacity-bench.sql "$DIRECT_URL"
```

```sh
# Option 2 — Node script hammering /api/checkout/test (write the test endpoint first)
# Reports max writes/sec, 5xx rate, and compares with a GET /events (control) to prove
# the instrument is actually distinguishing read from write. Repo does not yet ship a
# /capacity probe script; add one before a real sale.
```

As a control case, warm a CDN cache in front of `GET /events/:id` and measure the same 10k concurrent requests: the write-side numbers above do not apply to reads at all. A cached public event page returns ~0 DB hits and scales with the CDN.

## Your mileage varies by

- **Managed Postgres provider.** Aurora writes are not Neon writes are not Supabase writes are not a local Postgres you ran in Docker on a laptop. Run the probe.
- **Prisma vs raw driver.** Prisma's per-query overhead is small but real at 5k+ TPS; raw `pg` via `$queryRaw` and a prepared statement saves some microseconds per tx.
- **Transaction size.** The CAS alone is fast; wrapping CAS + reservation insert + audit log insert is the real tx. Minimizing the work inside `$transaction` after the CAS (not before) maximizes throughput.
- **Replica reads.** All listing pages (`/events`, `GET /api/events`) should go to a read replica if one is available; the only queries that must hit the primary are the CAS write, the TTL revert write, the reconcile write, and the confirm scan write.
