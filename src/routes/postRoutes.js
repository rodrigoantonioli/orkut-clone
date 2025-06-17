const express = require('express');
const router = express.Router();
const { createPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/in/:topicId', protect, createPost);

module.exports = router; 