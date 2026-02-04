import { cloudinary } from "../config/cloudinary";
import { AppError } from "../errors/appError";

/**
 * Payload for uploading a Base64 file
 */
type UploadBase64Payload = {
  /** Base64-encoded image string */
  base64: string;
  /** Cloudinary folder where the file will be stored */
  folder: "avatars" | "posts" | "covers";
  /** Optional publicId to update an existing image */
  publicId?: string;
  /** Optional MIME whitelist (default: JPEG/PNG) */
  allowedMimeTypes?: string[];
};

/**
 * Cloudinary service for handling image uploads and deletions
 */
class CloudinaryService {
  private readonly maxSizeMB = 2;

  /**
   * Upload a Base64-encoded image to Cloudinary
   *
   * @param payload - Base64 image, folder, optional publicId, and allowed MIME types
   * @returns Object containing the `url` and `path` (Cloudinary public_id)
   */
  async uploadBase64(payload: UploadBase64Payload) {
    const {
      base64,
      folder,
      publicId,
      allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"],
    } = payload;

    const normalizedBase64 = this.normalizeBase64(base64);

    // Validate MIME type
    const mimeType = this.extractMimeType(normalizedBase64);
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new AppError(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
        400,
      );
    }

    // Validate size
    const sizeMB = this.calculateBase64Size(normalizedBase64);
    if (sizeMB > this.maxSizeMB) {
      throw new AppError(
        `File is too large. Maximum allowed size is ${this.maxSizeMB} MB`,
        400,
      );
    }

    // Upload to Cloudinary
    try {
      const result = await cloudinary.uploader.upload(normalizedBase64, {
        folder,
        public_id: publicId,
        overwrite: Boolean(publicId),
        resource_type: "image",
      });

      return {
        url: result.secure_url,
        path: result.public_id,
      };
    } catch (error) {
      throw new AppError("Failed to upload image", 500);
    }
  }

  /**
   * Delete an image from Cloudinary using its publicId
   * @param publicId - The Cloudinary public_id to delete
   */
  async delete(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      throw new AppError("Failed to delete image", 400);
    }
  }

  /**
   * Normalize Base64 string to Cloudinary-compatible format
   * @param base64 - Raw Base64 string
   * @returns Base64 string with `data:image/jpeg;base64,` prefix if missing
   */
  private normalizeBase64(base64: string): string {
    if (base64.startsWith("data:")) return base64;
    return `data:image/jpeg;base64,${base64}`;
  }

  /**
   * Extract MIME type from Base64 string
   * @param base64 - Base64 string
   * @returns MIME type (e.g., image/jpeg)
   */
  private extractMimeType(base64: string): string {
    const match = base64.match(/^data:(.+);base64,/);
    if (!match) throw new AppError("Invalid Base64 format", 400);
    return match[1];
  }

  /**
   * Calculate approximate Base64 size in MB
   * @param base64 - Base64 string
   * @returns Size in megabytes
   */
  private calculateBase64Size(base64: string): number {
    const sizeInBytes =
      base64.length * (3 / 4) -
      (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
    return sizeInBytes / 1024 / 1024;
  }
}

export const cloudinaryService = new CloudinaryService();
