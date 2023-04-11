const mongoose = require('mongoose');

const shippingSchema = mongoose.Schema(
  {
    display_name: String,
    fees: Number,
    delivery_min: Number,
    delivery_min_unit: {
      type: String,
      enum: ['hour', 'day', 'business_day', 'week', 'month'],
    },
    delivery_max: Number,
    delivery_max_unit: {
      type: String,
      enum: ['hour', 'day', 'business_day', 'week', 'month'],
    },
    freeshipOrderOver: Number,
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
