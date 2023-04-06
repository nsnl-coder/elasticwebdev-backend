const mongoose = require('mongoose');

const variantSchema = mongoose.Schema(
  {
    variantName: {
      type: String,
      default: 'default name',
    },
    options: [
      {
        optionName: {
          type: String,
          default: 'unnamed option',
        },
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
    timestamps: true,
  },
);

const Variant = mongoose.model('variant', variantSchema);

module.exports = { variantSchema, Variant };
