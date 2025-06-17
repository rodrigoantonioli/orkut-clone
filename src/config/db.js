const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Inicializar dados padrão após conectar
    await initializeDatabase();
    
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    console.log('🔄 Verificando inicialização do banco de dados...');
    
    // Importar modelos
    const User = require('../models/User');
    const Community = require('../models/Community');
    
    // Verificar se já existem dados
    const userCount = await User.countDocuments();
    const communityCount = await Community.countDocuments();
    
    if (userCount === 0) {
      console.log('👤 Criando usuários padrão...');
      await createDefaultUsers();
    }
    
    if (communityCount === 0) {
      console.log('🏘️ Criando comunidades padrão...');
      await createDefaultCommunities();
    }
    
    // Garantir que os índices estejam criados
    await ensureIndexes();
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error.message);
  }
};

const createDefaultUsers = async () => {
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  
  const defaultUsers = [
    {
      name: 'Administrador',
      email: 'admin@orkut.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Administrador do sistema',
      location: 'Brasil',
      isAdmin: true
    },
    {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Usuário de exemplo - Desenvolvedor apaixonado por tecnologia',
      location: 'São Paulo, SP'
    },
    {
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Usuária de exemplo - Designer e artista digital',
      location: 'Rio de Janeiro, RJ'
    },
    {
      name: 'Pedro Oliveira',
      email: 'pedro@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Usuário de exemplo - Músico e produtor musical',
      location: 'Belo Horizonte, MG'
    }
  ];
  
  await User.insertMany(defaultUsers);
  console.log(`✅ ${defaultUsers.length} usuários padrão criados`);
};

const createDefaultCommunities = async () => {
  const Community = require('../models/Community');
  const User = require('../models/User');
  
  // Buscar o admin para ser criador das comunidades
  const admin = await User.findOne({ email: 'admin@orkut.com' });
  
  if (!admin) {
    console.log('⚠️ Admin não encontrado, pulando criação de comunidades');
    return;
  }
  
  const defaultCommunities = [
    {
      name: 'Eu amo programação',
      description: 'Comunidade para desenvolvedores apaixonados por código',
      category: 'Tecnologia',
      tags: ['programação', 'código', 'desenvolvimento'],
      rules: 'Seja respeitoso e compartilhe conhecimento',
      creator: admin._id,
      members: [admin._id],
      isPrivate: false
    },
    {
      name: 'Música Brasileira',
      description: 'Para quem ama MPB, sertanejo, rock nacional e toda música brasileira',
      category: 'Música',
      tags: ['mpb', 'sertanejo', 'rock', 'brasil'],
      rules: 'Compartilhe suas músicas favoritas e descubra novos artistas',
      creator: admin._id,
      members: [admin._id],
      isPrivate: false
    },
    {
      name: 'Filmes e Séries',
      description: 'Discussões sobre cinema, séries, documentários e entretenimento',
      category: 'Entretenimento',
      tags: ['filmes', 'séries', 'cinema', 'netflix'],
      rules: 'Evite spoilers sem aviso prévio',
      creator: admin._id,
      members: [admin._id],
      isPrivate: false
    },
    {
      name: 'Receitas Deliciosas',
      description: 'Compartilhe e descubra receitas incríveis',
      category: 'Culinária',
      tags: ['receitas', 'culinária', 'comida', 'gastronomia'],
      rules: 'Compartilhe receitas completas com ingredientes e modo de preparo',
      creator: admin._id,
      members: [admin._id],
      isPrivate: false
    },
    {
      name: 'Viagens pelo Brasil',
      description: 'Dicas, fotos e experiências de viagens pelo nosso país',
      category: 'Viagem',
      tags: ['viagem', 'turismo', 'brasil', 'destinos'],
      rules: 'Compartilhe dicas úteis e fotos de suas viagens',
      creator: admin._id,
      members: [admin._id],
      isPrivate: false
    }
  ];
  
  await Community.insertMany(defaultCommunities);
  console.log(`✅ ${defaultCommunities.length} comunidades padrão criadas`);
};

const ensureIndexes = async () => {
  try {
    const User = require('../models/User');
    const Community = require('../models/Community');
    const Scrap = require('../models/Scrap');
    
    // Criar índices para melhor performance
    await User.createIndexes();
    await Community.createIndexes();
    await Scrap.createIndexes();
    
    console.log('✅ Índices do banco de dados verificados');
  } catch (error) {
    console.error('⚠️ Erro ao criar índices:', error.message);
  }
};

module.exports = connectDB; 