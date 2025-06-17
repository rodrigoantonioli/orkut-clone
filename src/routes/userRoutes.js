const express = require('express');
const router = express.Router();
const { getUserProfile, searchUsers, getUserStats, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Rota pública para listar todos os usuários (deve vir antes das outras)
router.get('/', getAllUsers);

// Rota protegida para buscar usuários (deve vir antes da rota /:id)
router.get('/search', protect, searchUsers);

// Rota pública para obter perfil do usuário
router.get('/:id', getUserProfile);

// Rota pública para obter estatísticas do usuário
router.get('/:id/stats', getUserStats);

module.exports = router; 