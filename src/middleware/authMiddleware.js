const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pega o token do header (formato: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Não autorizado, token não fornecido' });
      }

      // Decodifica o token para pegar o ID do usuário
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário no banco pelo ID e anexa à requisição (sem a senha)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
      }

      req.user = user;
      next(); // Continua para a próxima etapa da requisição
    } catch (error) {
      console.error('Erro na autenticação:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
      }
      
      return res.status(401).json({ message: 'Não autorizado, falha na verificação do token' });
    }
  } else {
    return res.status(401).json({ message: 'Não autorizado, formato de token inválido' });
  }
};

// Middleware opcional - não bloqueia se não tiver token
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Em caso de erro, apenas não define req.user
      console.warn('Token opcional inválido:', error.message);
    }
  }
  
  next();
};

module.exports = {
  protect,
  optionalAuth,
}; 