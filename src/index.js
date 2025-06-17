const express = require('express');
const cors = require('cors'); // Importa o cors
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const scrapRoutes = require('./routes/scrapRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const communityRoutes = require('./routes/communityRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

// Carrega as variáveis de ambiente do .env
dotenv.config();

// Conecta ao banco de dados
connectDB();

const app = express();
const port = 3000;

app.use(cors()); // Habilita o CORS para todas as requisições
app.use(express.json()); // Middleware para parsear JSON

// Obter o diretório raiz do projeto
const projectRoot = process.cwd();

// Servir arquivos estáticos da pasta de uploads
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));
// Servir arquivos estáticos da pasta public do frontend
app.use(express.static(path.join(projectRoot, 'frontend', 'public')));

app.get('/', (req, res) => {
  res.send('Hello, Orkut!');
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/scraps', scrapRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(port, () => {
  console.log(`Orkut server listening at http://localhost:${port}`);
}); 