const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const upload = require('../middleware/upload');

router.post('/blog/post', upload.single('blogImage'), blogController.postBlog);
router.get('/blogs/:userId', blogController.getBlogByUser);
router.get('/blog/:blogId', blogController.getBlogById);
router.get('/blogs', blogController.getAllBlogs);
router.delete('/delete/blog/:blogId', blogController.deleteBlog);
router.put('/update/blog/:id', upload.single('blogImage'), blogController.updateBlog);

module.exports = router;

