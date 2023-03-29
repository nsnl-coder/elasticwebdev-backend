const mongoose = require('mongoose');

const variantSchema = mongoose.Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  options: {
    type: [
      {
        text: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
        },
        costPerItem: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
    ],
    default: undefined,
  },
});

const Variant = mongoose.model('variant', variantSchema);

module.exports = { variantSchema, Variant };
