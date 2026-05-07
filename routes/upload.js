const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");


router.post("/image", upload.single("image"), uploadController.uploadImage);
router.post("/images", upload.array("images", 10), uploadController.uploadMultipleImages);
router.post("/delete", uploadController.deleteImage);
router.post("/delete-multiple", uploadController.deleteMultipleImages);

// Get image metadata/info
router.post("/info", uploadController.getImageInfo);

// Transform image URL (resize, optimize, etc.)
router.post("/transform", uploadController.transformImage);

module.exports = router;
