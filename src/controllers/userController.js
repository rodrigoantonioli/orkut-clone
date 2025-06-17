const User = require('../models/User.js');

// @desc    Obter perfil do usuário
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação básica do ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('friends', 'name email profilePicture')
      .populate('communities', 'name description');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Buscar usuários por nome
// @route   GET /api/users/search?q=nome
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Query de busca deve ter pelo menos 2 caracteres' });
    }

    const users = await User.find({
      name: { $regex: q.trim(), $options: 'i' },
      _id: { $ne: req.user._id } // Exclui o próprio usuário dos resultados
    })
    .select('name email profilePicture')
    .limit(10)
    .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Obter estatísticas do usuário
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const user = await User.findById(id).select('friends communities createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Buscar estatísticas adicionais
    const [scrapCount, postCount] = await Promise.all([
      require('../models/Scrap').countDocuments({ recipient: id }),
      require('../models/Post').countDocuments({ author: id })
    ]);

    const stats = {
      friendsCount: user.friends?.length || 0,
      communitiesCount: user.communities?.length || 0,
      scrapsCount: scrapCount,
      postsCount: postCount,
      memberSince: user.createdAt
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Listar todos os usuários (para estatísticas)
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email profilePicture createdAt')
      .sort({ createdAt: -1 });

    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  searchUsers,
  getUserStats,
  getAllUsers,
}; 