const express = require('express');
const router = express.Router();
const {
  createCommunity,
  getAllCommunities,
  getCommunityDetails,
  joinCommunity,
  leaveCommunity,
  getCategories,
  getMyCommunities,
  getUserCommunities,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

// Rotas que devem vir antes das rotas com parâmetros
router.get('/categories', getCategories);
router.get('/my', protect, getMyCommunities);
router.get('/user/:id', getUserCommunities);

// Rotas principais
router.route('/')
  .get(getAllCommunities)
  .post(protect, createCommunity);

// Rotas com parâmetros (devem vir por último)
router.get('/:id', getCommunityDetails);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);

module.exports = router; 