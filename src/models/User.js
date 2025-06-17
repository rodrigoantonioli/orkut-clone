const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ],
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  friendRequestsSent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  friendRequestsReceived: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  communities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
  }],
  profilePicture: {
    type: String,
    default: '/uploads/default-avatar.svg',
  },
}, {
  timestamps: true,
});

// Índices para melhorar performance
userSchema.index({ email: 1 });
userSchema.index({ name: 'text' }); // Índice de texto para busca
userSchema.index({ friends: 1 });
userSchema.index({ createdAt: -1 });

// Criptografa a senha antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar a senha digitada com a senha do banco
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para obter dados públicos do usuário
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    profilePicture: this.profilePicture,
    createdAt: this.createdAt,
    friendsCount: this.friends?.length || 0,
    communitiesCount: this.communities?.length || 0,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User; 