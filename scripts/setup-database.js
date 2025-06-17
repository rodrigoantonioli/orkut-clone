require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar modelos
const User = require('../src/models/User');
const Community = require('../src/models/Community');
const Scrap = require('../src/models/Scrap');

const setupDatabase = async () => {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Perguntar se quer limpar dados existentes
    const args = process.argv.slice(2);
    const shouldReset = args.includes('--reset');

    if (shouldReset) {
      console.log('🗑️ Limpando dados existentes...');
      await User.deleteMany({});
      await Community.deleteMany({});
      await Scrap.deleteMany({});
      console.log('✅ Dados limpos');
    }

    // Criar usuários padrão
    await createUsers();
    
    // Criar comunidades padrão
    await createCommunities();
    
    // Criar alguns scraps de exemplo
    await createSampleScraps();

    console.log('🎉 Banco de dados configurado com sucesso!');
    console.log('\n📋 Usuários criados:');
    console.log('- admin@orkut.com (senha: 123456) - Administrador');
    console.log('- joao@exemplo.com (senha: 123456)');
    console.log('- maria@exemplo.com (senha: 123456)');
    console.log('- pedro@exemplo.com (senha: 123456)');
    console.log('- ana@exemplo.com (senha: 123456)');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

const createUsers = async () => {
  console.log('👤 Criando usuários...');
  
  const users = [
    {
      name: 'Administrador',
      email: 'admin@orkut.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Administrador do sistema Orkut Clone',
      location: 'Brasil',
      isAdmin: true
    },
    {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Desenvolvedor Full Stack apaixonado por JavaScript e React. Sempre em busca de novos desafios!',
      location: 'São Paulo, SP',
      interests: ['Programação', 'Tecnologia', 'Games', 'Música']
    },
    {
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Designer UX/UI e artista digital. Amo criar experiências incríveis para usuários.',
      location: 'Rio de Janeiro, RJ',
      interests: ['Design', 'Arte', 'Fotografia', 'Viagem']
    },
    {
      name: 'Pedro Oliveira',
      email: 'pedro@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Músico, produtor musical e apaixonado por som. Componho desde os 15 anos.',
      location: 'Belo Horizonte, MG',
      interests: ['Música', 'Produção Musical', 'Violão', 'Rock']
    },
    {
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      password: await bcrypt.hash('123456', 10),
      bio: 'Chef de cozinha e food blogger. Compartilho receitas deliciosas e dicas culinárias.',
      location: 'Porto Alegre, RS',
      interests: ['Culinária', 'Gastronomia', 'Viagem', 'Fotografia']
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} usuários criados`);
  
  return createdUsers;
};

const createCommunities = async () => {
  console.log('🏘️ Criando comunidades...');
  
  const admin = await User.findOne({ email: 'admin@orkut.com' });
  const joao = await User.findOne({ email: 'joao@exemplo.com' });
  const maria = await User.findOne({ email: 'maria@exemplo.com' });
  
  const communities = [
    {
      name: 'Eu amo programação',
      description: 'Comunidade para desenvolvedores apaixonados por código, tecnologia e inovação. Compartilhe projetos, tire dúvidas e conecte-se com outros devs!',
      category: 'Tecnologia',
      tags: ['programação', 'código', 'desenvolvimento', 'javascript', 'react'],
      rules: 'Seja respeitoso, compartilhe conhecimento, ajude outros membros e mantenha discussões construtivas.',
      creator: admin._id,
      members: [admin._id, joao._id],
      memberCount: 2,
      isPrivate: false
    },
    {
      name: 'Design & Criatividade',
      description: 'Espaço para designers, artistas e criativos compartilharem trabalhos, inspirações e técnicas.',
      category: 'Arte',
      tags: ['design', 'arte', 'criatividade', 'ui', 'ux'],
      rules: 'Compartilhe trabalhos originais, dê feedback construtivo e respeite direitos autorais.',
      creator: maria._id,
      members: [maria._id, admin._id],
      memberCount: 2,
      isPrivate: false
    },
    {
      name: 'Música Brasileira',
      description: 'Para quem ama MPB, sertanejo, rock nacional e toda música brasileira. Descubra novos artistas!',
      category: 'Música',
      tags: ['mpb', 'sertanejo', 'rock', 'brasil', 'música'],
      rules: 'Compartilhe músicas, artistas e experiências musicais. Respeite todos os gêneros.',
      creator: admin._id,
      members: [admin._id],
      memberCount: 1,
      isPrivate: false
    },
         {
       name: 'Filmes e Séries',
       description: 'Discussões sobre cinema, séries, documentários e entretenimento em geral.',
       category: 'Filmes',
       tags: ['filmes', 'séries', 'cinema', 'netflix', 'entretenimento'],
       rules: 'Evite spoilers sem aviso prévio. Use tags de spoiler quando necessário.',
       creator: admin._id,
       members: [admin._id],
       memberCount: 1,
       isPrivate: false
     },
    {
      name: 'Receitas Deliciosas',
      description: 'Compartilhe e descubra receitas incríveis, dicas culinárias e experiências gastronômicas.',
      category: 'Culinária',
      tags: ['receitas', 'culinária', 'comida', 'gastronomia', 'cozinha'],
      rules: 'Compartilhe receitas completas com ingredientes e modo de preparo detalhado.',
      creator: admin._id,
      members: [admin._id],
      memberCount: 1,
      isPrivate: false
    },
    {
      name: 'Viagens pelo Brasil',
      description: 'Dicas, fotos e experiências de viagens pelo nosso lindo país.',
      category: 'Viagem',
      tags: ['viagem', 'turismo', 'brasil', 'destinos', 'aventura'],
      rules: 'Compartilhe dicas úteis, fotos de suas viagens e experiências reais.',
      creator: admin._id,
      members: [admin._id],
      memberCount: 1,
      isPrivate: false
    },
         {
       name: 'Gamers Unidos',
       description: 'Comunidade para gamers de todos os tipos: PC, console, mobile e retro gaming.',
       category: 'Jogos',
       tags: ['games', 'gaming', 'pc', 'console', 'mobile'],
       rules: 'Respeite todos os tipos de jogadores e plataformas. Sem toxicidade.',
       creator: joao._id,
       members: [joao._id, admin._id],
       memberCount: 2,
       isPrivate: false
     }
  ];

  const createdCommunities = await Community.insertMany(communities);
  console.log(`✅ ${createdCommunities.length} comunidades criadas`);
  
  return createdCommunities;
};

const createSampleScraps = async () => {
  console.log('📝 Criando scraps de exemplo...');
  
  const users = await User.find().limit(5);
  const admin = users.find(u => u.email === 'admin@orkut.com');
  const joao = users.find(u => u.email === 'joao@exemplo.com');
  const maria = users.find(u => u.email === 'maria@exemplo.com');
  
  if (!admin || !joao || !maria) {
    console.log('⚠️ Usuários não encontrados para criar scraps');
    return;
  }
  
  const scraps = [
    {
      author: admin._id,
      content: 'Bem-vindos ao Orkut Clone! Espero que gostem da plataforma 😊'
    },
    {
      author: joao._id,
      content: 'Primeira postagem aqui! Está ficando incrível, parabéns pelo trabalho! 👏'
    },
    {
      author: maria._id,
      content: 'Adorei o design da plataforma! Muito nostálgico e moderno ao mesmo tempo 🎨'
    },
    {
      author: admin._id,
      content: 'Obrigado pessoal! Seu feedback é muito importante para nós ❤️'
    }
  ];
  
  const createdScraps = await Scrap.insertMany(scraps);
  console.log(`✅ ${createdScraps.length} scraps de exemplo criados`);
  
  return createdScraps;
};

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 