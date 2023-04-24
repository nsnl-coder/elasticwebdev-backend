import { Schema, model } from 'mongoose';
import { productSchema } from './productModel';
import { shippingSchema } from './shippingModel';
import { IOrder } from '../yup/orderSchema';
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: Number,
    subTotal: Number,
    grandTotal: Number,
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
    fullname: String,
    email: String,
    phone: String,
    shippingMethod: shippingSchema,
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
    paymentStatus: {
      type: String,
      enum: ['fail', 'paid', 'refunded'],
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
