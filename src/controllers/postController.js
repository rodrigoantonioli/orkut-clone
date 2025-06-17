const Post = require('../models/Post');
const Topic = require('../models/Topic');
const Community = require('../models/Community');

const createPost = async (req, res) => {
  const { content } = req.body;
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado.' });
    
    // Verifica se o usuário é membro da comunidade para poder postar
    const community = await Community.findById(topic.community);
    if (!community.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Você precisa ser membro para postar neste tópico.' });
    }

    const post = await Post.create({
      content,
      author: req.user._id,
      topic: topicId,
    });

    topic.posts.push(post._id);
    await topic.save();

    const populatedPost = await Post.findById(post._id).populate('author', 'name profilePicture');
    res.status(201).json(populatedPost);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar post', error: error.message });
  }
};

module.exports = { createPost }; 