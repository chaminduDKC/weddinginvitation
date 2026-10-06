import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

// Initialize Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
}

/**
 * Upload payment slip to Cloudinary with type "authenticated".
 * Server ensures only admins receive signed URLs to view authenticated files.
 */
export const uploadSlipToCloudinary = async (
  fileBuffer: Buffer,
  mimetype: string,
  userId: string
): Promise<UploadResult> => {
  // If Cloudinary is not configured (e.g. initial dev), use mock fallback
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.log(`ℹ️ [Dev Mock] Uploading slip for user ${userId} (${mimetype}, ${fileBuffer.length} bytes)`);
    const mockId = `mock_slip_${userId}_${Date.now()}`;
    const base64 = fileBuffer.toString("base64");
    const dataUri = `data:${mimetype};base64,${base64}`;
    return {
      publicId: mockId,
      secureUrl: dataUri,
    };
  }

  return new Promise((resolve, reject) => {
    const isPdf = mimetype === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "wedding_slips",
        type: "authenticated", // Non-negotiable: authenticated delivery type
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload payment slip to secure storage"));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Generate a time-limited signed URL for administrators to view an authenticated payment slip.
 */
export const generateSignedSlipUrl = (publicId: string, isPdf = false): string => {
  // If it's a dev mock data URI or mock ID
  if (publicId.startsWith("mock_slip_")) {
    return "";
  }

  // 1-hour expiration for admin inspection
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;

  return cloudinary.utils.url(publicId, {
    type: "authenticated",
    sign_url: true,
    expires_at: expiresAt,
    resource_type: isPdf ? "raw" : "image",
    secure: true,
  });
};

/**
 * Upload public image assets (e.g. template thumbnails) to Cloudinary or base64 fallback.
 */
export const uploadPublicImageToCloudinary = async (
  fileBuffer: Buffer,
  mimetype: string,
  prefix: string
): Promise<UploadResult> => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.log(`ℹ️ [Dev Mock] Uploading public image ${prefix} (${mimetype}, ${fileBuffer.length} bytes)`);
    const mockId = `mock_thumb_${prefix}_${Date.now()}`;
    const base64 = fileBuffer.toString("base64");
    const dataUri = `data:${mimetype};base64,${base64}`;
    return {
      publicId: mockId,
      secureUrl: dataUri,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "wedding_templates",
        type: "upload",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary public image upload error:", error);
          reject(new Error("Failed to upload image to cloud storage"));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Extract public_id from a Cloudinary URL (e.g. template thumbnails).
 * Works for standard Cloudinary URLs with folders, transformations, and versions.
 */
export const extractCloudinaryPublicId = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("res.cloudinary.com")) return null;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const afterUpload = pathname.substring(uploadIndex + "/upload/".length);
    const segments = afterUpload.split("/");

    while (segments.length > 0) {
      const seg = segments[0];
      if (!seg) break;
      // Version segment: v followed by digits
      if (/^v\d+$/.test(seg)) {
        segments.shift();
        break;
      }
      // Transformation segments (contains commas or standard prefixes like c_, w_, h_)
      if (seg.includes(",") || /^[a-z]{1,3}_/.test(seg)) {
        segments.shift();
        continue;
      }
      break;
    }

    if (segments.length === 0) return null;

    const fullPublicIdWithExt = decodeURIComponent(segments.join("/"));
    const lastDotIndex = fullPublicIdWithExt.lastIndexOf(".");
    if (lastDotIndex === -1) return fullPublicIdWithExt;
    return fullPublicIdWithExt.substring(0, lastDotIndex);
  } catch {
    return null;
  }
};

/**
 * Delete a public image asset from Cloudinary (e.g. old template thumbnail).
 * Safely handles external non-Cloudinary URLs, dev mocks, and Cloudinary errors.
 */
export const deleteCloudinaryImage = async (urlOrPublicId: string): Promise<boolean> => {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") {
    return false;
  }

  // If Cloudinary is not configured in dev, mock deletion
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.log(`ℹ️ [Dev Mock] Deleting old image asset: ${urlOrPublicId.slice(0, 60)}...`);
    return true;
  }

  // If it's a URL, extract publicId
  const publicId = urlOrPublicId.includes("res.cloudinary.com")
    ? extractCloudinaryPublicId(urlOrPublicId)
    : urlOrPublicId.startsWith("http") || urlOrPublicId.startsWith("data:")
    ? null
    : urlOrPublicId;

  if (!publicId) {
    // Not a Cloudinary resource (e.g. Unsplash, data URI, placeholder)
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    console.log(`🗑️ Cloudinary image deleted successfully: "${publicId}" (result: ${result.result})`);
    return result.result === "ok";
  } catch (error) {
    console.error(`⚠️ Failed to delete Cloudinary image ("${publicId}"):`, error);
    return false;
  }
};
