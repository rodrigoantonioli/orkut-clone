const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome da comunidade é obrigatório'],
      trim: true,
      unique: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
      maxlength: [50, 'Nome deve ter no máximo 50 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
      minlength: [10, 'Descrição deve ter pelo menos 10 caracteres'],
      maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
    },
    category: {
      type: String,
      required: [true, 'Categoria é obrigatória'],
      enum: {
        values: [
          'Música', 'Filmes', 'Livros', 'Esportes', 'Tecnologia', 
          'Jogos', 'Culinária', 'Viagem', 'Arte', 'Educação',
          'Negócios', 'Saúde', 'Moda', 'Fotografia', 'Animais',
          'Humor', 'Religião', 'Política', 'Ciência', 'Outros'
        ],
        message: 'Categoria inválida'
      },
      default: 'Outros'
    },
    image: {
      type: String,
      default: '/uploads/default-community.svg',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      }
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: String,
      maxlength: [1000, 'Regras devem ter no máximo 1000 caracteres'],
      default: '',
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    stats: {
      memberCount: {
        type: Number,
        default: 0,
      },
      topicCount: {
        type: Number,
        default: 0,
      },
      postCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar performance
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });
communitySchema.index({ category: 1 });
communitySchema.index({ creator: 1 });
communitySchema.index({ members: 1 });
communitySchema.index({ createdAt: -1 });
communitySchema.index({ 'stats.memberCount': -1 });

// Middleware para atualizar contadores
communitySchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.stats.memberCount = this.members.length;
  }
  if (this.isModified('topics')) {
    this.stats.topicCount = this.topics.length;
  }
  next();
});

// Método para verificar se usuário é membro
communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

// Método para verificar se usuário é moderador
communitySchema.methods.isModerator = function(userId) {
  return this.moderators.some(mod => mod.toString() === userId.toString()) || 
         this.creator.toString() === userId.toString();
};

// Método para obter dados públicos da comunidade
communitySchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    image: this.image,
    creator: this.creator,
    stats: this.stats,
    isPrivate: this.isPrivate,
    tags: this.tags,
    createdAt: this.createdAt,
  };
};

const Community = mongoose.model('Community', communitySchema);

module.exports = Community; 