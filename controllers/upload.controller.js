import cloudinary from "../configs/cloudinary.js";

/**
 * Generate signed upload signature for client-side uploads
 * This allows frontend to upload directly to Cloudinary
 */
export const generateUploadSignature = async (req, res) => {
  try {
    const { folder = "social_media_uploads", resourceType = "auto" } = req.body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Generate signature for secure uploads
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        upload_preset: "unsigned_preset", // We'll create this
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error("Generate signature error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate upload signature",
    });
  }
};

/**
 * Alternative: Generate upload preset (unsigned uploads)
 * Simpler but less secure - good for development
 */
export const getUploadConfig = async (req, res) => {
  try {
    // Get upload preset from environment or use default
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default";

    res.json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: uploadPreset,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Get upload config error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get upload config",
    });
  }
};
