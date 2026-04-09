const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/image", upload.single("image"), (req, res) => {
  res.json({
    url: req.file.path
  });
});

module.exports = router;