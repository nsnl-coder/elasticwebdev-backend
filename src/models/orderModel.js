const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    // from client
    items: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
        },
        name: String,
        slug: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        variants: [
          {
            variantName: String,
            optionName: String,
            photo: String,
          },
        ],
      },
    ],
    fullname: String,
    email: String,
    phone: String,
    shippingAddress: String,
    shippingOption: String,
    orderNotes: String,
    discountCode: String,
    //
    shippingStatus: {
      type: String,
      default: 'pending',
    },
    //
    paymentStatus: {
      type: String,
    },
    paymentVia: String,

    //
    orderNumber: Number,
    subTotal: Number,
    shippingFees: Number,
    grandTotal: Number,
    discountPercentage: Number,
    discountDollar: Number,

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
