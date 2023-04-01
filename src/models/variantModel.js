const mongoose = require('mongoose');

const variantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: 'default name',
    },
    options: [
      {
        optionName: String,
        photo: String,
      },
    ],
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

const Variant = mongoose.model('variant', variantSchema);

module.exports = { variantSchema, Variant };
