const express = require('express');
const router = express.Router();
const { createScrap, getScraps, getScrapsByUser } = require('../controllers/scrapController');
const { protect } = require('../middleware/authMiddleware');

// Rota para listar scraps e criar um novo scrap
router.route('/').get(getScraps).post(protect, createScrap);
router.route('/user/:userId').get(getScrapsByUser);

module.exports = router; 