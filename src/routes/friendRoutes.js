const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

// Aplica o middleware de proteção a todas as rotas deste arquivo
router.use(protect);

// Rotas para obter listas
router.get('/', getFriends);
router.get('/requests', getFriendRequests);

// Rotas para ações com um usuário específico
router.post('/request/:id', sendFriendRequest);
router.post('/accept/:id', acceptFriendRequest);
router.post('/reject/:id', rejectFriendRequest);
router.delete('/remove/:id', removeFriend);

module.exports = router; 