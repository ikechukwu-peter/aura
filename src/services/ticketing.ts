import { prisma } from "../lib/prisma";
import { ReservationStatus, TicketStatus } from "@prisma/client";
import crypto from "crypto";
import { generateTicketToken } from "../lib/qr";

export class TicketingService {
  /**
   * Reserve tickets for an event with capacity protection and idempotency.
   */
  static async reserveTickets(params: {
    userId: string;
    eventId: string;
    quantity: number;
    idempotencyKey: string;
  }) {
    const { userId, eventId, quantity, idempotencyKey } = params;

    return await prisma.$transaction(async (tx) => {
      // 1. Check idempotency
      const existingReservation = await tx.reservation.findUnique({
        where: { idempotencyKey },
      });
      if (existingReservation) return existingReservation;

      // 2. Check event status and capacity
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event || event.status !== "PUBLISHED") {
        throw new Error("Event not available");
      }

      // ATOMIC CAPACITY CHECK & INCREMENT (Pessimistic approach)
      try {
        await tx.event.update({
          where: { 
            id: eventId,
            ticketsIssuedCount: {
              lte: event.capacity - quantity
            }
          },
          data: { ticketsIssuedCount: { increment: quantity } },
        });
      } catch (error) {
        throw new Error("Not enough tickets available or event closed");
      }

      // 3. Create reservation with TTL (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const reservation = await tx.reservation.create({
        data: {
          userId,
          eventId,
          quantity,
          expiresAt,
          idempotencyKey,
          status: ReservationStatus.ACTIVE,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "RESERVATION_CREATED",
          entityType: "RESERVATION",
          entityId: reservation.id,
          metadata: JSON.stringify({ eventId, quantity }),
        },
      });

      return reservation;
    });
  }

  /**
   * Confirm reservation and issue tickets.
   */
  static async confirmReservation(reservationId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { event: true },
      });

      if (!reservation || reservation.userId !== userId) {
        throw new Error("Reservation not found");
      }

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new Error("Reservation is no longer active");
      }

      if (reservation.expiresAt < new Date()) {
        // Handle expired reservation lazily if not already handled by cleanup job
        await this.handleExpiredReservation(tx, reservationId);
        throw new Error("Reservation has expired");
      }

      // 1. Issue tickets
      // Get current ticket count for this user and event to set indices
      const currentTicketCount = await tx.ticket.count({
        where: { userId: reservation.userId, eventId: reservation.eventId },
      });

      const tickets = await Promise.all(
        Array.from({ length: reservation.quantity }).map(async (_, i) => {
          const ticketCode = crypto.randomBytes(12).toString("hex").toUpperCase();
          
          // 1. Create ticket first to get ID for token
          const ticket = await (tx.ticket.create as any)({
            data: {
              userId: reservation.userId,
              eventId: reservation.eventId,
              ticketIndex: currentTicketCount + i,
              code: ticketCode,
              pricePaid: (reservation.event as any).price,
              status: TicketStatus.ISSUED,
              qrPayload: "PENDING", // Temporary
            },
          });

          // 2. Generate secure token
          const token = await generateTicketToken({
            ticketId: ticket.id,
            ticketCode: ticketCode,
            eventId: reservation.eventId,
            userId: reservation.userId,
          });

          // 3. Update with token
          return tx.ticket.update({
            where: { id: ticket.id },
            data: { qrPayload: token },
          });
        })
      );

      // 2. Update reservation status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CONVERTED },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: "TICKETS_ISSUED",
          entityType: "RESERVATION",
          entityId: reservationId,
          metadata: JSON.stringify({ count: tickets.length }),
        },
      });

      return tickets;
    });
  }

  /**
   * Handle expired reservations (revert capacity).
   */
  static async handleExpiredReservation(tx: any, reservationId: string) {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation || reservation.status !== ReservationStatus.ACTIVE) return;

    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.EXPIRED },
    });

    await tx.event.update({
      where: { id: reservation.eventId },
      data: { ticketsIssuedCount: { decrement: reservation.quantity } },
    });

    await tx.auditLog.create({
      data: {
        action: "RESERVATION_EXPIRED",
        entityType: "RESERVATION",
        entityId: reservationId,
        metadata: JSON.stringify({ eventId: reservation.eventId, quantity: reservation.quantity }),
      },
    });
  }

  /**
   * Cleanup task to find and expire old reservations.
   */
  static async cleanupExpiredReservations() {
    const expired = await prisma.reservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
    });

    for (const res of expired) {
      await prisma.$transaction(async (tx) => {
        await this.handleExpiredReservation(tx, res.id);
      });
    }

    // After cleanup, run reconciliation to fix any drifts
    await this.reconcileCapacity();
  }

  /**
   * Capacity Reconciliation: Self-healing background worker.
   * Sums active reservations and issued tickets, then compares with event.ticketsIssuedCount.
   */
  static async reconcileCapacity() {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
    });

    for (const event of events) {
      // 1. Sum ACTIVE reservations (not yet expired)
      const activeReservations = await prisma.reservation.aggregate({
        where: {
          eventId: event.id,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: new Date() },
        },
        _sum: { quantity: true },
      });

      // 2. Count ISSUED/USED tickets
      const issuedTickets = await prisma.ticket.count({
        where: {
          eventId: event.id,
          status: { in: [TicketStatus.ISSUED, TicketStatus.USED] },
        },
      });

      const actualTotal = (activeReservations._sum.quantity || 0) + issuedTickets;

      // 3. Compare and fix if mismatch
      if (actualTotal !== event.ticketsIssuedCount) {
        await prisma.$transaction(async (tx) => {
          await tx.event.update({
            where: { id: event.id },
            data: { ticketsIssuedCount: actualTotal },
          });

          await tx.auditLog.create({
            data: {
              action: "CAPACITY_RECONCILED",
              entityType: "EVENT",
              entityId: event.id,
              metadata: JSON.stringify({
                oldValue: event.ticketsIssuedCount,
                newValue: actualTotal,
                reason: "Mismatch detected by reconciler",
              }),
            },
          });
        });
        console.log(`[Reconciler] Fixed capacity drift for event ${event.id}: ${event.ticketsIssuedCount} -> ${actualTotal}`);
      }
    }
  }
}
