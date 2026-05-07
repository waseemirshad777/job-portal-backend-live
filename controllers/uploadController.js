const imageService = require('../services/imageService');

const uploadController = {
  /**
   * Upload single image to Cloudinary
   * Returns complete URL ready to store in database
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(200).json({
          message: { image: 'No image file provided' },
          status: 422
        });
      }

      const imageUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary

      console.log('[UploadController] Image uploaded successfully:', imageUrl);

      res.status(200).json({
        message: 'Image uploaded successfully',
        status: 201,
        data: {
          url: imageUrl,
          public_id: req.file.filename
        }
      });
    } catch (error) {
      console.error('[UploadController] Error uploading image:', error);
      res.status(500).json({
        message: 'Failed to upload image',
        error: error.message
      });
    }
  },

  /**
   * Upload multiple images to Cloudinary
   * Returns array of URLs
   */
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(200).json({
          message: { images: 'No images provided' },
          status: 422
        });
      }

      const uploadedImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
        size: file.size,
        mimetype: file.mimetype
      }));

      console.log('[UploadController] Batch upload completed:', uploadedImages.length, 'images');

      res.status(200).json({
        message: `${uploadedImages.length} images uploaded successfully`,
        status: 201,
        data: {
          images: uploadedImages,
          count: uploadedImages.length
        }
      });
    } catch (error) {
      console.error('[UploadController] Error uploading multiple images:', error);
      res.status(500).json({
        message: 'Failed to upload images',
        error: error.message
      });
    }
  },

  /**
   * Delete image from Cloudinary using URL
   * Expects: { imageUrl: "https://res.cloudinary.com/..." }
   */
  async deleteImage(req, res) {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(200).json({
          message: { imageUrl: 'Image URL is required' },
          status: 422
        });
      }

      if (!imageService.isValidCloudinaryUrl(imageUrl)) {
        return res.status(200).json({
          message: { imageUrl: 'Invalid Cloudinary URL' },
          status: 422
        });
      }

      const result = await imageService.deleteImage(imageUrl);

      if (result.success) {
        res.status(200).json({
          message: 'Image deleted successfully',
          status: 200
        });
      } else {
        res.status(200).json({
          message: { error: result.message },
          status: 400,
          error: result.error
        });
      }
    } catch (error) {
      console.error('[UploadController] Error deleting image:', error);
      res.status(500).json({
        message: 'Failed to delete image',
        error: error.message
      });
    }
  },

  /**
   * Delete multiple images in batch
   * Expects: { imageUrls: ["url1", "url2", ...] }
   */
  async deleteMultipleImages(req, res) {
    try {
      const { imageUrls } = req.body;

      if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(200).json({
          message: { imageUrls: 'Array of image URLs is required' },
          status: 422
        });
      }

      // Validate all URLs are Cloudinary URLs
      const invalidUrls = imageUrls.filter(url => !imageService.isValidCloudinaryUrl(url));
      if (invalidUrls.length > 0) {
        return res.status(200).json({
          message: { imageUrls: `${invalidUrls.length} invalid Cloudinary URLs` },
          status: 422,
          invalidUrls
        });
      }

      const result = await imageService.deleteMultipleImages(imageUrls);

      res.status(200).json({
        message: `${result.deleted} images deleted, ${result.failed} failed`,
        status: result.success ? 200 : 400,
        data: {
          deleted: result.deleted,
          failed: result.failed,
          errors: result.errors
        }
      });
    } catch (error) {
      console.error('[UploadController] Error deleting multiple images:', error);
      res.status(500).json({
        message: 'Failed to delete images',
        error: error.message
      });
    }
  },

  /**
   * Get image information/metadata
   * Expects: { imageUrl: "https://res.cloudinary.com/..." }
   */
  async getImageInfo(req, res) {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(200).json({
          message: { imageUrl: 'Image URL is required' },
          status: 422
        });
      }

      if (!imageService.isValidCloudinaryUrl(imageUrl)) {
        return res.status(200).json({
          message: { imageUrl: 'Invalid Cloudinary URL' },
          status: 422
        });
      }

      const result = await imageService.getImageMetadata(imageUrl);

      if (result.success) {
        res.status(200).json({
          message: 'Image metadata retrieved',
          status: 200,
          data: result.data
        });
      } else {
        res.status(200).json({
          message: { error: result.error },
          status: 400
        });
      }
    } catch (error) {
      console.error('[UploadController] Error getting image info:', error);
      res.status(500).json({
        message: 'Failed to get image information',
        error: error.message
      });
    }
  },

  /**
   * Transform image URL (resize, optimize, etc.)
   * Expects: { imageUrl: "...", transformations: { width: 300, height: 300, ... } }
   */
  async transformImage(req, res) {
    try {
      const { imageUrl, transformations } = req.body;

      if (!imageUrl) {
        return res.status(200).json({
          message: { imageUrl: 'Image URL is required' },
          status: 422
        });
      }

      if (!imageService.isValidCloudinaryUrl(imageUrl)) {
        return res.status(200).json({
          message: { imageUrl: 'Invalid Cloudinary URL' },
          status: 422
        });
      }

      const transformedUrl = imageService.transformImageUrl(imageUrl, transformations);

      res.status(200).json({
        message: 'Image URL transformed',
        status: 200,
        data: {
          original: imageUrl,
          transformed: transformedUrl
        }
      });
    } catch (error) {
      console.error('[UploadController] Error transforming image:', error);
      res.status(500).json({
        message: 'Failed to transform image',
        error: error.message
      });
    }
  }
};

module.exports = uploadController;
