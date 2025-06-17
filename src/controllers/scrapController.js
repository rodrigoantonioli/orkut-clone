const Scrap = require('../models/Scrap.js');

// @desc    Criar um novo scrap
// @route   POST /api/scraps
// @access  Private
const createScrap = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'O conteúdo não pode estar vazio.' });
  }

  try {
    const scrap = new Scrap({
      content,
      author: req.user._id, // O ID vem do middleware 'protect'
    });

    const createdScrap = await scrap.save();
    res.status(201).json(createdScrap);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Listar todos os scraps
// @route   GET /api/scraps
// @access  Public (por enquanto)
const getScraps = async (req, res) => {
  try {
    const scraps = await Scrap.find({})
      .populate('author', 'name email profilePicture') // Incluindo profilePicture
      .sort({ createdAt: 'desc' }); // Ordena do mais novo para o mais antigo
    res.json(scraps);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Listar scraps de um usuário específico
// @route   GET /api/scraps/user/:userId
// @access  Public
const getScrapsByUser = async (req, res) => {
  try {
    const scraps = await Scrap.find({ author: req.params.userId })
      .populate('author', 'name email profilePicture') // Incluindo profilePicture
      .sort({ createdAt: 'desc' });
    res.json(scraps);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

module.exports = {
  createScrap,
  getScraps,
  getScrapsByUser,
}; 