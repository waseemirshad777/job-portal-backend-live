const cloudinary = require('../config/cloudinary');

const imageService = {
  /**
   * Delete image from Cloudinary using secure URL
   * @param {string} imageUrl - Full Cloudinary image URL
   * @returns {Promise<{success: boolean, message: string, error?: string}>}
   */
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl) {
        return {
          success: false,
          message: 'Image URL is required'
        };
      }

      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
      // We need to extract the public_id including the folder
      const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
      const match = imageUrl.match(regex);

      if (!match || !match[1]) {
        return {
          success: false,
          message: 'Invalid Cloudinary URL format',
          error: 'Could not extract public_id from URL'
        };
      }

      const publicId = match[1];
      console.log('[ImageService] Deleting image:', publicId);

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        console.log('[ImageService] Image deleted successfully:', publicId);
        return {
          success: true,
          message: 'Image deleted successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to delete image from Cloudinary',
          error: result.result || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('[ImageService] Error deleting image:', error);
      return {
        success: false,
        message: 'Error deleting image',
        error: error.message
      };
    }
  },

  /**
   * Delete multiple images from Cloudinary
   * @param {string[]} imageUrls - Array of Cloudinary image URLs
   * @returns {Promise<{success: boolean, deleted: number, failed: number, errors: Array}>}
   */
  async deleteMultipleImages(imageUrls) {
    try {
      if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return {
          success: false,
          deleted: 0,
          failed: 0,
          errors: ['No image URLs provided']
        };
      }

      const results = {
        deleted: 0,
        failed: 0,
        errors: []
      };

      for (const url of imageUrls) {
        const result = await this.deleteImage(url);
        if (result.success) {
          results.deleted++;
        } else {
          results.failed++;
          results.errors.push({
            url: url,
            error: result.error || result.message
          });
        }
      }

      return {
        success: results.failed === 0,
        ...results
      };
    } catch (error) {
      console.error('[ImageService] Error deleting multiple images:', error);
      return {
        success: false,
        deleted: 0,
        failed: imageUrls.length,
        errors: [error.message]
      };
    }
  },

  /**
   * Extract public_id from Cloudinary URL
   * Useful for direct operations on the image
   * @param {string} imageUrl - Full Cloudinary image URL
   * @returns {string|null}
   */
  getPublicIdFromUrl(imageUrl) {
    try {
      const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
      const match = imageUrl.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('[ImageService] Error extracting public_id:', error);
      return null;
    }
  },

  /**
   * Get image metadata from Cloudinary
   * @param {string} imageUrl - Full Cloudinary image URL
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getImageMetadata(imageUrl) {
    try {
      const publicId = this.getPublicIdFromUrl(imageUrl);
      
      if (!publicId) {
        return {
          success: false,
          error: 'Could not extract public_id from URL'
        };
      }

      const result = await cloudinary.api.resource(publicId);
      
      return {
        success: true,
        data: {
          publicId: result.public_id,
          url: result.secure_url,
          size: result.bytes,
          width: result.width,
          height: result.height,
          format: result.format,
          createdAt: result.created_at,
          uploadedAt: result.uploaded_at
        }
      };
    } catch (error) {
      console.error('[ImageService] Error getting image metadata:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Transform/optimize image URL with Cloudinary transformations
   * @param {string} imageUrl - Full Cloudinary image URL
   * @param {object} transformations - Cloudinary transformation options
   * @returns {string}
   */
  transformImageUrl(imageUrl, transformations = {}) {
    try {
      const publicId = this.getPublicIdFromUrl(imageUrl);
      
      if (!publicId) {
        return imageUrl; // Return original if extraction fails
      }

      // Default transformations
      const defaultTransforms = {
        quality: 'auto',
        fetch_format: 'auto',
        ...transformations
      };

      return cloudinary.url(publicId, defaultTransforms);
    } catch (error) {
      console.error('[ImageService] Error transforming image URL:', error);
      return imageUrl; // Return original on error
    }
  },

  /**
   * Validate if a URL is a valid Cloudinary URL
   * @param {string} imageUrl - URL to validate
   * @returns {boolean}
   */
  isValidCloudinaryUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }
    return imageUrl.includes('res.cloudinary.com');
  }
};

module.exports = imageService;
