import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ImageService } from "@/services/images";
import path from "path";
import fs from "fs/promises";

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

    // Ensure upload directories exist
    const baseDir = path.join(process.cwd(), "public/uploads/events");
    await fs.mkdir(path.join(baseDir, "original"), { recursive: true });
    await fs.mkdir(path.join(baseDir, "banners"), { recursive: true });
    await fs.mkdir(path.join(baseDir, "thumbs"), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // We don't have eventId yet during initial upload in the wizard
    // So we'll just process it and return the paths.
    // The final event creation will link these paths.
    const imageInfo = await ImageService.processEventImage(buffer, "temp");

    return NextResponse.json(imageInfo);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
