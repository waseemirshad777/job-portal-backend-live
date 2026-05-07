/**
 * Upload Helper Utility
 * Easy-to-use functions for image upload/delete throughout the project
 * Import this in any controller and use the functions directly
 */

const imageService = require('../services/imageService');

const uploadHelper = {
  /**
   * Handle image deletion when updating/deleting records
   * @param {string} oldImageUrl - Previous image URL stored in DB
   * @param {string} newImageUrl - New image URL (if updating)
   * @returns {Promise<boolean>}
   */
  async handleImageReplacement(oldImageUrl, newImageUrl) {
    try {
      // If updating with a new image, delete the old one
      if (oldImageUrl && oldImageUrl !== newImageUrl && imageService.isValidCloudinaryUrl(oldImageUrl)) {
        const deleteResult = await imageService.deleteImage(oldImageUrl);
        if (!deleteResult.success) {
          console.warn('[UploadHelper] Failed to delete old image:', oldImageUrl, deleteResult.error);
        }
      }
      return true;
    } catch (error) {
      console.error('[UploadHelper] Error in handleImageReplacement:', error);
      return false;
    }
  },

  /**
   * Handle deletion of images when deleting a record
   * @param {string|string[]} imageUrls - Single URL or array of URLs
   * @returns {Promise<{success: boolean, deleted: number, failed: number}>}
   */
  async handleImageDeletion(imageUrls) {
    try {
      if (!imageUrls) {
        return { success: true, deleted: 0, failed: 0 };
      }

      // Handle single URL
      if (typeof imageUrls === 'string') {
        if (imageService.isValidCloudinaryUrl(imageUrls)) {
          const result = await imageService.deleteImage(imageUrls);
          return {
            success: result.success,
            deleted: result.success ? 1 : 0,
            failed: result.success ? 0 : 1
          };
        }
        return { success: true, deleted: 0, failed: 0 };
      }

      // Handle array of URLs
      if (Array.isArray(imageUrls)) {
        const validUrls = imageUrls.filter(url => imageService.isValidCloudinaryUrl(url));
        if (validUrls.length === 0) {
          return { success: true, deleted: 0, failed: 0 };
        }

        const result = await imageService.deleteMultipleImages(validUrls);
        return {
          success: result.success,
          deleted: result.deleted,
          failed: result.failed
        };
      }

      return { success: true, deleted: 0, failed: 0 };
    } catch (error) {
      console.error('[UploadHelper] Error in handleImageDeletion:', error);
      return { success: false, deleted: 0, failed: 1 };
    }
  },

  /**
   * Prepare image data before storing in database
   * Validates and formats image URL
   * @param {string} imageUrl - Cloudinary URL from upload
   * @returns {{url: string, publicId: string}|null}
   */
  prepareImageForDB(imageUrl) {
    try {
      if (!imageUrl || !imageService.isValidCloudinaryUrl(imageUrl)) {
        return null;
      }

      return {
        url: imageUrl,
        publicId: imageService.getPublicIdFromUrl(imageUrl)
      };
    } catch (error) {
      console.error('[UploadHelper] Error in prepareImageForDB:', error);
      return null;
    }
  },

  /**
   * Get optimized image URL for different use cases
   * @param {string} imageUrl - Original Cloudinary URL
   * @param {string} type - Type: 'thumbnail', 'profile', 'banner', 'gallery', 'default'
   * @returns {string}
   */
  getOptimizedImageUrl(imageUrl, type = 'default') {
    try {
      if (!imageService.isValidCloudinaryUrl(imageUrl)) {
        return imageUrl;
      }

      const transformations = {
        thumbnail: {
          width: 150,
          height: 150,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        },
        profile: {
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto'
        },
        banner: {
          width: 1200,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        },
        gallery: {
          width: 600,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        },
        default: {
          quality: 'auto',
          fetch_format: 'auto'
        }
      };

      return imageService.transformImageUrl(imageUrl, transformations[type] || transformations.default);
    } catch (error) {
      console.error('[UploadHelper] Error in getOptimizedImageUrl:', error);
      return imageUrl;
    }
  },

  /**
   * Validate if image URL exists and is accessible
   * @param {string} imageUrl - URL to validate
   * @returns {boolean}
   */
  isValidImageUrl(imageUrl) {
    return imageService.isValidCloudinaryUrl(imageUrl);
  },

  /**
   * Extract public ID from image URL
   * Useful when you need the public ID for Cloudinary operations
   * @param {string} imageUrl - Cloudinary URL
   * @returns {string|null}
   */
  getPublicId(imageUrl) {
    return imageService.getPublicIdFromUrl(imageUrl);
  }
};

module.exports = uploadHelper;
