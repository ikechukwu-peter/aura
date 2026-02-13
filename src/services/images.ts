import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase";

export class ImageService {
  private static BUCKET_NAME = "events";

  static async processEventImage(fileBuffer: Buffer, eventId: string, userId: string) {
    const filename = `${uuidv4()}.webp`;
    
    // 1. Process images using sharp
    const original = await sharp(fileBuffer)
      .webp({ quality: 90 })
      .toBuffer();
    
    const metadata = await sharp(original).metadata();

    const banner = await sharp(original)
      .resize(1200, 630, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    const thumb = await sharp(original)
      .resize(400, 300, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    // 2. Upload to Supabase Storage
    const uploadTasks = [
      this.uploadToSupabase(`original/${filename}`, original, "image/webp", userId),
      this.uploadToSupabase(`banners/${filename}`, banner, "image/webp", userId),
      this.uploadToSupabase(`thumbs/${filename}`, thumb, "image/webp", userId)
    ];

    const results = await Promise.all(uploadTasks);

    // 3. Return the public URLs
    return {
      originalPath: results[0],
      bannerPath: results[1],
      thumbPath: results[2],
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: original.length,
    };
  }

  private static async uploadToSupabase(path: string, buffer: Buffer, contentType: string, userId: string): Promise<string> {
    const { error } = await supabaseAdmin.storage
      .from(this.BUCKET_NAME)
      .upload(path, buffer, {
        contentType,
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.error(`Supabase upload error for ${path}:`, error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Set the owner manually so RLS policies work correctly
    // This requires the service role to have access to the storage schema
    try {
      const storageAdmin = supabaseAdmin as any;
      if (typeof storageAdmin.schema === 'function') {
        await storageAdmin.schema('storage').from('objects').update({
          owner: userId
        }).match({
          bucket_id: this.BUCKET_NAME,
          name: path
        });
      }
    } catch (ownerError) {
      console.error(`Failed to set owner for ${path}:`, ownerError);
      // We don't throw here as the upload was successful, 
      // but RLS might not work as expected for this file.
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);

    return publicUrl;
  }

  static async deleteEventImages(paths: string[]) {
    const { error } = await supabaseAdmin.storage
      .from(this.BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error("Supabase delete error:", error);
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  }
}
