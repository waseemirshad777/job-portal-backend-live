// const multer = require('multer');
// const path = require('path');

// Configure storage for multer
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Directory to save uploaded files
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // Appends the extension of the original file
//     }
// });

// Configure multer
// const upload = multer({ storage: storage });

// module.exports = upload;


const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });

module.exports = upload;