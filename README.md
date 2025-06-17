# 🌟 Orkut Clone

Uma recriação nostálgica da famosa rede social Orkut, desenvolvida com tecnologias modernas.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com Express.js
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Multer** para upload de arquivos

### Frontend
- **React** com Vite
- **React Router** para navegação
- **CSS Modules** para estilização
- **Context API** para gerenciamento de estado

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/orkut-clone.git
cd orkut-clone
```

### 2. Configuração das variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# IMPORTANTE: O arquivo .env nunca deve ser commitado no Git!
```

### 3. Configure as variáveis no arquivo `.env`:
```env
# String de conexão do MongoDB
MONGO_URI=mongodb://localhost:27017/orkut
# ou para MongoDB Atlas:
# MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/orkut

# Chave secreta para JWT (IMPORTANTE: Use uma chave forte!)
JWT_SECRET=sua_chave_secreta_jwt_muito_forte_aqui

# Porta do servidor (opcional)
PORT=5000

# Ambiente
NODE_ENV=development
```

### 4. Instalação das dependências
```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd frontend
npm install
cd ..
```

### 5. Executar o projeto
```bash
# Modo desenvolvimento (backend + frontend)
npm run dev

# Ou executar separadamente:
# Backend apenas
npm run server

# Frontend apenas (em outro terminal)
npm run client
```

## 🔒 Segurança

### ⚠️ IMPORTANTE - Antes de publicar no GitHub:

1. **NUNCA commite o arquivo `.env`** - ele está no `.gitignore` por segurança
2. **Use senhas fortes** para JWT_SECRET e banco de dados
3. **Mantenha dependências atualizadas**
4. **Use HTTPS em produção**

### Gerando uma chave JWT segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurações de segurança implementadas:
- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Validação de entrada em todos os endpoints
- ✅ Middleware de autenticação
- ✅ Sanitização de dados
- ✅ Headers de segurança
- ✅ Proteção contra injeção NoSQL

## 📁 Estrutura do Projeto

```
orkut-clone/
├── src/                     # Backend
│   ├── config/             # Configurações (DB)
│   ├── controllers/        # Lógica dos endpoints
│   ├── middleware/         # Middlewares (auth, etc)
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Rotas da API
│   └── index.js           # Servidor principal
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── context/       # Context API (Auth)
│   │   ├── pages/         # Páginas da aplicação
│   │   └── styles/        # Estilos globais
│   └── public/            # Arquivos estáticos
├── uploads/               # Arquivos de upload
├── .env.example          # Exemplo de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
└── README.md             # Este arquivo
```

## 🌟 Funcionalidades

### ✅ Implementadas
- **Autenticação completa** (registro, login, logout)
- **Perfis de usuário** com foto e informações
- **Sistema de amizades** (enviar, aceitar, recusar pedidos)
- **Scraps** (mensagens no perfil)
- **Comunidades** com categorias e fórum
- **Busca de usuários** em tempo real
- **Upload de fotos** de perfil
- **Interface responsiva**

### 🚧 Em desenvolvimento
- Sistema de fotos/álbuns
- Notificações em tempo real
- Chat privado
- Sistema de depoimentos

## 🎨 Capturas de Tela

### Página Inicial
![Home](docs/screenshots/home.png)

### Perfil do Usuário
![Profile](docs/screenshots/profile.png)

### Comunidades
![Communities](docs/screenshots/communities.png)

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users/:id` - Buscar usuário
- `GET /api/users/search` - Buscar usuários
- `PUT /api/users/:id` - Atualizar perfil

### Amizades
- `POST /api/friends/request/:id` - Enviar pedido
- `POST /api/friends/accept/:id` - Aceitar pedido
- `POST /api/friends/reject/:id` - Recusar pedido
- `GET /api/friends/requests` - Listar pedidos

### Comunidades
- `GET /api/communities` - Listar comunidades
- `POST /api/communities` - Criar comunidade
- `GET /api/communities/:id` - Detalhes da comunidade
- `POST /api/communities/:id/join` - Entrar na comunidade

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido por

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - seu.email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/orkut-clone](https://github.com/seu-usuario/orkut-clone)

## 🙏 Agradecimentos

- Inspirado no saudoso Orkut
- Ícones e design baseados na interface original
- Comunidade open source

---

⭐ Se este projeto te ajudou, considere dar uma estrela! 