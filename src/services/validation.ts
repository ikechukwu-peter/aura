import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export class ValidationService {
  /**
   * Validate a ticket by its code and mark as USED.
   */
  static async validateTicket(params: {
    code: string;
    eventId: string;
    validatorId: string;
  }) {
    const { code, eventId, validatorId } = params;

    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { code },
        include: { event: true, user: true },
      });

      if (!ticket) {
        throw new Error("Invalid ticket code");
      }

      if (ticket.eventId !== eventId) {
        throw new Error("Ticket is for a different event");
      }

      if (ticket.status === TicketStatus.USED) {
        throw new Error(`Ticket already used at ${ticket.validatedAt?.toLocaleString()}`);
      }

      if (ticket.status !== TicketStatus.ISSUED) {
        throw new Error(`Ticket is invalid (Status: ${ticket.status})`);
      }

      // Mark as USED
      const updatedTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: TicketStatus.USED,
          validatedAt: new Date(),
          validatedBy: validatorId,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: validatorId,
          action: "TICKET_VALIDATED",
          entityType: "TICKET",
          entityId: ticket.id,
          metadata: JSON.stringify({ eventId, code }),
        },
      });

      return updatedTicket;
    });
  }
}
