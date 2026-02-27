import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (!isConfigured) {
  console.warn('⚠️ Cloudinary is not configured - image upload will be disabled');
}

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image (with or without data URI prefix)
 * @param {string} folder - Folder name in Cloudinary (default: 'nexlevel')
 * @returns {Promise<object>} - { url, publicId }
 */
export async function uploadToCloudinary(base64Image, folder = 'nexlevel') {
  if (!isConfigured) {
    throw new Error('Cloudinary API is not configured. Please set CLOUDINARY credentials.');
  }

  try {
    // Upload to Cloudinary with automatic format optimization
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max size to save storage
        { quality: 'auto' }, // Automatic quality optimization
        { fetch_format: 'auto' }, // Automatic format selection (WebP for modern browsers)
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw new Error('Image upload failed: ' + error.message);
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteFromCloudinary(publicId) {
  if (!isConfigured) {
    throw new Error('Cloudinary API is not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {

      return true;
    } else {
      throw new Error('Failed to delete image: ' + result.result);
    }
  } catch (error) {
    console.error('❌ Cloudinary deletion error:', error.message);
    throw error;
  }
}

/**
 * Get Cloudinary usage stats
 */
export async function getCloudinaryUsage() {
  if (!isConfigured) {
    throw new Error('Cloudinary API is not configured');
  }

  try {
    const result = await cloudinary.api.usage();
    return {
      usedStorage: result.storage.used,
      totalStorage: result.storage.limit,
      bandwidth: result.bandwidth,
      resources: result.resources,
    };
  } catch (error) {
    console.error('❌ Error fetching Cloudinary usage:', error.message);
    throw error;
  }
}

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUsage
};
