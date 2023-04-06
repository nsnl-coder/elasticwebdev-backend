const mongoose = require('mongoose');

const shippingSchema = mongoose.Schema(
  {
    name: String,
    fees: Number,
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

const Shipping = mongoose.model('shipping', shippingSchema);

module.exports = { shippingSchema, Shipping };
