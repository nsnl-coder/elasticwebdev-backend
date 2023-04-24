import { Schema, model } from 'mongoose';
import { IOrder } from '../yup/orderSchema';

const orderSchema = new Schema<IOrder>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    orderNumber: Number,
    subTotal: Number,
    grandTotal: Number,
    items: [
      {
        productName: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        photos: [String],
        variants: [
          {
            variantName: String,
            optionName: String,
          },
        ],
      },
    ],
    fullname: String,
    email: String,
    phone: String,
    shipping: {
      name: String,
      fees: Number,
    },
    discount: {
      inDollar: Number,
      inPercent: Number,
      couponCode: String,
    },
    shippingStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'processing', 'shipped', 'arrived'],
    },
    shippingAddress: String,
    notes: String,
    paymentStatus: {
      type: String,
      enum: ['fail', 'paid', 'refunded', 'processing'],
      default: 'processing',
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
    timestamps: true,
  },
);

const Order = model<IOrder>('order', orderSchema);

export { orderSchema, Order };
