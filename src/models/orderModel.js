const mongoose = require('mongoose');
const { productSchema } = require('./productModel');
const { shippingSchema } = require('./shippingModel');

const orderSchema = mongoose.Schema(
  {
    orderNumber: Number,
    subTotal: Number,
    grandTotal: Number,
    // from client
    items: [
      {
        product: productSchema,
        quantity: {
          type: Number,
          default: 1,
        },
        image: String,
        variants: [
          {
            variantName: String,
            optionName: String,
            photo: String,
          },
        ],
      },
    ],
    shippingInfo: {
      fullname: String,
      email: String,
      address: {
        country: String,
        city: String,
        line1: String,
        line2: String,
        postal_code: String,
      },
      notes: String,
      phone: String,
      carrier: String,
      tracking_number: String,
    },
    shippingMethod: shippingSchema,
    discount: {
      inDollar: Number,
      inPercent: Number,
      couponCode: String,
    },
    //
    shippingStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'processing', 'shipped', 'arrived'],
    },
    paymentStatus: {
      type: String,
    },
    paymentVia: String,

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

const Order = mongoose.model('order', orderSchema);

module.exports = { orderSchema, Order };
