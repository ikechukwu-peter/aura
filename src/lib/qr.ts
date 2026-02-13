import { SignJWT, jwtVerify } from "jose";

const TICKET_SECRET = new TextEncoder().encode(
  process.env.TICKET_SECRET || "super-secret-ticket-signing-key-change-this-in-prod"
);

export async function generateTicketToken(data: {
  ticketId: string;
  ticketCode: string;
  eventId: string;
  userId: string;
}) {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(TICKET_SECRET);
}

export async function verifyTicketToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, TICKET_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as {
      ticketId: string;
      ticketCode: string;
      eventId: string;
      userId: string;
    };
  } catch (error) {
    return null;
  }
}
