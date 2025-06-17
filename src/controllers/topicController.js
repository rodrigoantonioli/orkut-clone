const Topic = require('../models/Topic');
const Community = require('../models/Community');

const createTopic = async (req, res) => {
  const { title } = req.body;
  const { communityId } = req.params;

  try {
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: 'Comunidade não encontrada' });
    if (!community.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Você não é membro desta comunidade.' });
    }

    const topic = await Topic.create({
      title,
      author: req.user._id,
      community: communityId,
    });

    community.topics.push(topic._id);
    await community.save();

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tópico', error: error.message });
  }
};

const getTopicsByCommunity = async (req, res) => {
  try {
    const topics = await Topic.find({ community: req.params.communityId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: 'desc' });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tópicos', error: error.message });
  }
};

const getTopicDetails = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId).populate({
      path: 'posts',
      populate: { path: 'author', select: 'name profilePicture' },
    }).populate('author', 'name profilePicture');
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado' });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar tópico', error: error.message });
  }
};

module.exports = { createTopic, getTopicsByCommunity, getTopicDetails }; 