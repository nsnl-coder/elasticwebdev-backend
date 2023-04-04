const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    stars: {
      type: Number,
    },
    content: {
      type: String,
    },
    // testing purpose only
    test_string: String,
    test_number: Number,
    test_any: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  },
);

const Rating = mongoose.model('rating', ratingSchema);

module.exports = { ratingSchema, Rating };
