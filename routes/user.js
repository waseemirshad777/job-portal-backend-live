const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const upload = require('../middleware/upload');

router.get('/users', userController.listUsers);
router.get('/user/:id', userController.getUser);
router.put('/user/update/:id', upload.single('profilePhoto'), userController.updateUser);
router.delete('/user/delete/:id', userController.deleteUser);
router.put('/user/password/update/:id', userController.updatePassword);

module.exports = router;
