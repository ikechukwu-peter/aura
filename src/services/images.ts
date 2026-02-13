import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export class ImageService {
  private static UPLOAD_DIR = path.join(process.cwd(), "public/uploads/events");

  static async processEventImage(fileBuffer: Buffer, eventId: string) {
    const filename = `${uuidv4()}.webp`;
    
    const originalPath = path.join(this.UPLOAD_DIR, "original", filename);
    const bannerPath = path.join(this.UPLOAD_DIR, "banners", filename);
    const thumbPath = path.join(this.UPLOAD_DIR, "thumbs", filename);

    // 1. Process and save original (as WebP)
    const original = await sharp(fileBuffer)
      .webp({ quality: 90 })
      .toBuffer();
    
    const metadata = await sharp(original).metadata();
    
    await fs.writeFile(originalPath, original);

    // 2. Generate banner (1200x630, object-fit: cover)
    await sharp(original)
      .resize(1200, 630, { fit: "cover" })
      .webp({ quality: 85 })
      .toFile(bannerPath);

    // 3. Generate thumbnail (400x300, object-fit: cover)
    await sharp(original)
      .resize(400, 300, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    return {
      originalPath: `/uploads/events/original/${filename}`,
      bannerPath: `/uploads/events/banners/${filename}`,
      thumbPath: `/uploads/events/thumbs/${filename}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: original.length,
    };
  }
}
