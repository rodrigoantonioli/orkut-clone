const express = require('express');
const router = express.Router();
const { upload, uploadProfilePicture } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/profile', protect, upload.single('image'), uploadProfilePicture);

module.exports = router; 