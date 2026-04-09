const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');


router.post('/add-category', categoryController.postCategory);
router.get('/categories', categoryController.categories);
router.delete('/category/:id', categoryController.deleteCategory);
router.put('/update-category/:id', categoryController.updateCategory);

module.exports = router;

