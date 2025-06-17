const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Community',
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic; 