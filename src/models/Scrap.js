const mongoose = require('mongoose');

const scrapSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Cria uma referência ao modelo User
    },
    // No futuro, podemos adicionar um 'recipient' para scraps em perfis de outros
  },
  {
    timestamps: true,
  }
);

const Scrap = mongoose.model('Scrap', scrapSchema);

module.exports = Scrap; 