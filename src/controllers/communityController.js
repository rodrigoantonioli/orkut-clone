const Community = require('../models/Community');
const User = require('../models/User');

// @desc    Criar uma nova comunidade
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
  const { name, description, category, tags, rules, isPrivate } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ message: 'Nome e descrição são obrigatórios.' });
  }

  try {
    // Verificar se já existe uma comunidade com esse nome
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCommunity) {
      return res.status(400).json({ message: 'Já existe uma comunidade com esse nome.' });
    }

    const community = await Community.create({
      name: name.trim(),
      description: description.trim(),
      category: category || 'Outros',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      rules: rules || '',
      isPrivate: isPrivate || false,
      creator: req.user._id,
      members: [req.user._id],
      moderators: [req.user._id],
    });

    // Adiciona a comunidade à lista do usuário criador
    await User.findByIdAndUpdate(req.user._id, {
      $push: { communities: community._id }
    });

    // Popular dados antes de retornar
    const populatedCommunity = await Community.findById(community._id)
      .populate('creator', 'name email profilePicture')
      .populate('members', 'name profilePicture');

    res.status(201).json(populatedCommunity);
  } catch (error) {
    console.error('Erro ao criar comunidade:', error);
    res.status(500).json({ message: 'Erro ao criar comunidade', error: error.message });
  }
};

// @desc    Listar todas as comunidades com filtros
// @route   GET /api/communities
// @access  Public
const getAllCommunities = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort = 'newest', 
      limit = 20, 
      page = 1 
    } = req.query;

    let query = { isPrivate: false }; // Apenas comunidades públicas
    let sortOptions = {};

    // Filtro por categoria
    if (category && category !== 'all') {
      query.category = category;
    }

    // Busca por texto
    if (search) {
      query.$text = { $search: search };
    }

    // Opções de ordenação
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { 'stats.memberCount': -1 };
        break;
      case 'active':
        sortOptions = { 'stats.postCount': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [communities, total] = await Promise.all([
      Community.find(query)
        .populate('creator', 'name profilePicture')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip),
      Community.countDocuments(query)
    ]);

    res.json({
      communities,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + communities.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    });
  } catch (error) {
    console.error('Erro ao buscar comunidades:', error);
    res.status(500).json({ message: 'Erro ao buscar comunidades', error: error.message });
  }
};

// @desc    Obter detalhes de uma comunidade
// @route   GET /api/communities/:id
// @access  Public
const getCommunityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de comunidade inválido' });
    }

    const community = await Community.findById(id)
      .populate('creator', 'name email profilePicture')
      .populate('members', 'name profilePicture')
      .populate('moderators', 'name profilePicture');
      
    if (!community) {
      return res.status(404).json({ message: 'Comunidade não encontrada.' });
    }

    res.json(community);
  } catch (error) {
    console.error('Erro ao buscar detalhes da comunidade:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da comunidade', error: error.message });
  }
};

// @desc    Entrar em uma comunidade
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    
    if (!community) {
      return res.status(404).json({ message: 'Comunidade não encontrada.' });
    }

    if (community.isPrivate) {
      return res.status(403).json({ message: 'Esta comunidade é privada.' });
    }

    if (community.isMember(userId)) {
      return res.status(400).json({ message: 'Você já é membro desta comunidade.' });
    }

    // Adicionar usuário à comunidade
    community.members.push(userId);
    await community.save();

    // Adicionar comunidade ao usuário
    await User.findByIdAndUpdate(userId, {
      $push: { communities: community._id }
    });

    res.json({ message: 'Você entrou na comunidade com sucesso!' });
  } catch (error) {
    console.error('Erro ao entrar na comunidade:', error);
    res.status(500).json({ message: 'Erro ao entrar na comunidade', error: error.message });
  }
};

// @desc    Sair de uma comunidade
// @route   POST /api/communities/:id/leave
// @access  Private
const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    
    if (!community) {
      return res.status(404).json({ message: 'Comunidade não encontrada.' });
    }

    if (community.creator.toString() === userId.toString()) {
      return res.status(400).json({ 
        message: 'O criador não pode sair da comunidade. Transfira a propriedade primeiro.' 
      });
    }

    if (!community.isMember(userId)) {
      return res.status(400).json({ message: 'Você não é membro desta comunidade.' });
    }

    // Remover usuário da comunidade
    community.members.pull(userId);
    community.moderators.pull(userId); // Remove também de moderadores se for o caso
    await community.save();

    // Remover comunidade do usuário
    await User.findByIdAndUpdate(userId, {
      $pull: { communities: community._id }
    });

    res.json({ message: 'Você saiu da comunidade.' });
  } catch (error) {
    console.error('Erro ao sair da comunidade:', error);
    res.status(500).json({ message: 'Erro ao sair da comunidade', error: error.message });
  }
};

// @desc    Obter categorias disponíveis
// @route   GET /api/communities/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = [
      'Música', 'Filmes', 'Livros', 'Esportes', 'Tecnologia', 
      'Jogos', 'Culinária', 'Viagem', 'Arte', 'Educação',
      'Negócios', 'Saúde', 'Moda', 'Fotografia', 'Animais',
      'Humor', 'Religião', 'Política', 'Ciência', 'Outros'
    ];

    // Contar comunidades por categoria
    const categoryCounts = await Community.aggregate([
      { $match: { isPrivate: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoriesWithCount = categories.map(category => {
      const found = categoryCounts.find(c => c._id === category);
      return {
        name: category,
        count: found ? found.count : 0
      };
    });

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
  }
};

// @desc    Obter comunidades do usuário
// @route   GET /api/communities/my
// @access  Private
const getMyCommunities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'communities',
        populate: {
          path: 'creator',
          select: 'name profilePicture'
        }
      });

    res.json(user.communities || []);
  } catch (error) {
    console.error('Erro ao buscar minhas comunidades:', error);
    res.status(500).json({ message: 'Erro ao buscar minhas comunidades', error: error.message });
  }
};

// @desc    Obter comunidades de um usuário específico
// @route   GET /api/communities/user/:id
// @access  Public
const getUserCommunities = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const user = await User.findById(id)
      .populate({
        path: 'communities',
        populate: {
          path: 'creator',
          select: 'name profilePicture'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user.communities || []);
  } catch (error) {
    console.error('Erro ao buscar comunidades do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar comunidades do usuário', error: error.message });
  }
};

module.exports = {
  createCommunity,
  getAllCommunities,
  getCommunityDetails,
  joinCommunity,
  leaveCommunity,
  getCategories,
  getMyCommunities,
  getUserCommunities,
}; 