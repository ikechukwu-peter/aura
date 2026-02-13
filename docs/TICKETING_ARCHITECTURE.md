# Ticketing Architecture: Defense in Depth

This document outlines the multi-layered strategy implemented to ensure ticketing correctness, atomic capacity protection, and failover proofing in the system.

## 1. Atomic Capacity Protection (Pessimistic Locking)

To prevent "overselling" (where concurrent requests see available capacity before either has updated the count), we use a **Pessimistic Compare-and-Swap** approach within a database transaction.

### Implementation Details:
- **Location**: `src/services/ticketing.ts` -> `reserveTickets`
- **Mechanism**: Instead of reading capacity and then updating it in two separate steps, we use Prisma's `update` with a strict `where` clause:
  ```typescript
  await tx.event.update({
    where: { 
      id: eventId,
      ticketsIssuedCount: { lte: event.capacity - quantity } 
    },
    data: { ticketsIssuedCount: { increment: quantity } }
  });
  ```
- **Benefit**: This ensures that the increment only happens if the capacity condition is met at the exact moment of the write. If another process updated the count in the millisecond between our initial read and this update, the `where` clause will fail, and the transaction will roll back.

## 2. Idempotent Booking via Unique Keys

To prevent duplicate bookings (e.g., a user clicking "Buy" twice or a network retry), we use **Idempotency Keys** and **Database Constraints**.

### Implementation Details:
- **Idempotency Key**: Every reservation request requires a unique `idempotencyKey` (usually generated on the client). The `Reservation` model has a `@unique` constraint on this key.
- **Ticket Unique Constraint**: 
  - **Location**: `prisma/schema.prisma` -> `Ticket` model
  - **Constraint**: `@@unique([userId, eventId, ticketIndex])`
- **Benefit**: Even if the application logic fails or multiple requests bypass the initial checks, the database will physically block the creation of duplicate tickets for the same user and event beyond the allowed limit.

## 3. Self-Healing Capacity Reconciliation

Distributed systems can suffer from "orphaned transactions" (e.g., a server crashes after incrementing capacity but before completing the reservation). We implement a background worker to reconcile these drifts.

### Implementation Details:
- **Location**: `src/services/ticketing.ts` -> `reconcileCapacity`
- **Process**:
  1. Sum all **ACTIVE** (non-expired) reservations for an event.
  2. Count all **ISSUED** and **USED** tickets for that event.
  3. Compare the sum against the `event.ticketsIssuedCount` stored in the database.
  4. If a mismatch is detected, the worker atomically updates the count to the correct value and logs the correction.
- **Trigger**: Runs automatically after every `cleanupExpiredReservations` cycle.

## 4. Transactional Integrity

All ticketing operations (reservation, confirmation, expiration) are wrapped in **Prisma Transactions**. This ensures that either all steps succeed (e.g., ticket created AND reservation updated AND audit log written) or none do, maintaining a consistent state at all times.

---

### Security Summary
- **Database Level**: Unique constraints (idempotency, ticket limits).
- **Application Level**: Atomic updates, status checks, ownership verification.
- **Recovery Level**: Background reconciler for orphaned state recovery.
