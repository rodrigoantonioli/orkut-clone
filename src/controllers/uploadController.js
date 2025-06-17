const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Erro: Apenas imagens são permitidas!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.profilePicture = `/uploads/${req.file.filename}`;
            await user.save();
            res.json({
                message: 'Upload bem-sucedido',
                imagePath: user.profilePicture,
            });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error: error.message });
    }
};

module.exports = { upload, uploadProfilePicture }; 