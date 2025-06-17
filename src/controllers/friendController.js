const User = require('../models/User');

// @desc    Enviar um pedido de amizade
// @route   POST /api/friends/request/:id
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id);
    const recipient = await User.findById(req.params.id);

    if (!recipient) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Validar se já não são amigos ou se já existe um pedido
    if (recipient.friendRequestsReceived.includes(sender._id) || sender.friends.includes(recipient._id)) {
      return res.status(400).json({ message: 'Pedido de amizade já enviado ou vocês já são amigos.' });
    }

    recipient.friendRequestsReceived.push(sender._id);
    sender.friendRequestsSent.push(recipient._id);

    await recipient.save();
    await sender.save();

    res.status(200).json({ message: 'Pedido de amizade enviado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Aceitar um pedido de amizade
// @route   POST /api/friends/accept/:id
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const acceptor = await User.findById(req.user._id);
    const sender = await User.findById(req.params.id);

    if (!sender) {
      return res.status(404).json({ message: 'Usuário que enviou o pedido não encontrado.' });
    }

    // Remover dos arrays de pedidos
    acceptor.friendRequestsReceived = acceptor.friendRequestsReceived.filter(id => id.toString() !== sender._id.toString());
    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id.toString() !== acceptor._id.toString());

    // Adicionar aos arrays de amigos
    acceptor.friends.push(sender._id);
    sender.friends.push(acceptor._id);

    await acceptor.save();
    await sender.save();

    res.status(200).json({ message: 'Amigo adicionado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Rejeitar um pedido de amizade
// @route   POST /api/friends/reject/:id
// @access  Private
const rejectFriendRequest = async (req, res) => {
  try {
    const rejector = await User.findById(req.user._id);
    const sender = await User.findById(req.params.id);

    if (!sender) {
      return res.status(404).json({ message: 'Usuário que enviou o pedido não encontrado.' });
    }

    // Apenas remove dos arrays de pedidos
    rejector.friendRequestsReceived = rejector.friendRequestsReceived.filter(id => id.toString() !== sender._id.toString());
    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id.toString() !== rejector._id.toString());

    await rejector.save();
    await sender.save();

    res.status(200).json({ message: 'Pedido de amizade rejeitado.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Remover um amigo
// @route   DELETE /api/friends/remove/:id
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const remover = await User.findById(req.user._id);
    const friendToRemove = await User.findById(req.params.id);

    if (!friendToRemove) {
      return res.status(404).json({ message: 'Amigo não encontrado.' });
    }

    remover.friends = remover.friends.filter(id => id.toString() !== friendToRemove._id.toString());
    friendToRemove.friends = friendToRemove.friends.filter(id => id.toString() !== remover._id.toString());

    await remover.save();
    await friendToRemove.save();

    res.status(200).json({ message: 'Amizade desfeita.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Listar amigos de um usuário
// @route   GET /api/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email profilePicture');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// @desc    Listar pedidos de amizade recebidos
// @route   GET /api/friends/requests
// @access  Private
const getFriendRequests = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate('friendRequestsReceived', 'name email profilePicture');
      res.json(user.friendRequestsReceived);
    } catch (error) {
      res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
  };

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
}; 