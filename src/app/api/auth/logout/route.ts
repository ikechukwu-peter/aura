import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function GET(req: Request) {
  await deleteSession();
  
  const url = new URL(req.url);
  const redirect = url.origin + "/login";
  
  return NextResponse.redirect(redirect);
}
