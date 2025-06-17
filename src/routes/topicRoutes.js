const express = require('express');
const router = express.Router();
const { createTopic, getTopicsByCommunity, getTopicDetails } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

router.post('/in/:communityId', protect, createTopic);
router.get('/for/:communityId', getTopicsByCommunity);
router.get('/:topicId', getTopicDetails);

module.exports = router; 