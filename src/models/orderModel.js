const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
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
    // user info
    fullname: String,
    email: String,
    phone: String,
    shippingAddress: String,

    // order info
    orderNumber: Number,
    subTotal: Number,
    shippingFees: Number,
    shippingOption: String,
    grandTotal: Number,
    orderStatus: String,
    isPaid: Boolean,
    paymentVia: String,
    orderNotes: String,
    discount: {
      code: String,
      amountInPercentage: Number,
      amountInDollar: Number,
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

const Order = mongoose.model('order', orderSchema);

module.exports = { orderSchema, Order };
