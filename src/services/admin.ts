import { prisma } from "@/lib/prisma";
import { TicketStatus, AuditLog } from "@prisma/client";

export class AdminService {
  static async getDashboardStats() {
    const [userCount, eventCount, ticketCount, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.ticket.count({ where: { status: TicketStatus.ISSUED } }),
      prisma.ticket.count(), // Simplification: in this app all tickets are free/fixed for now
    ]);

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    });

    return {
      stats: {
        userCount,
        eventCount,
        ticketCount,
      },
      recentAuditLogs,
    };
  }

  static async approveEvent(eventId: string, adminId: string) {
    return await prisma.$transaction(async (tx) => {
      const event = await tx.event.update({
        where: { id: eventId },
        data: { approvedByAdmin: true, status: "PUBLISHED" },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "EVENT_APPROVED",
          entityType: "EVENT",
          entityId: eventId,
          metadata: JSON.stringify({ title: event.title }),
        },
      });

      return event;
    });
  }

  static async revokeTicket(ticketId: string, adminId: string, reason: string) {
    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.CANCELLED },
      });

      // Revert capacity
      await tx.event.update({
        where: { id: ticket.eventId },
        data: { ticketsIssuedCount: { decrement: 1 } },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "TICKET_REVOKED",
          entityType: "TICKET",
          entityId: ticketId,
          metadata: JSON.stringify({ reason, eventId: ticket.eventId }),
        },
      });

      return ticket;
    });
  }
}
