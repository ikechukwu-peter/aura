import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ImageService } from "@/services/images";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Pass the userId (session.userId) so the storage object gets the correct owner
    const imageInfo = await ImageService.processEventImage(buffer, "temp", session.userId);

    return NextResponse.json(imageInfo);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
