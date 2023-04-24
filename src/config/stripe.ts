import Stripe from 'stripe';
import type { Response } from 'express';
import { IOrder } from '../yup/orderSchema';
import createError from '../utils/createError';

const createStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.log('Can not read stripe secret key from .env');
    return;
  }
  const stripe = new Stripe(secretKey, {
    typescript: true,
    apiVersion: '2022-11-15',
  });

  return stripe;
};

const createPaymentIntent = async (res: Response, order: IOrder) => {
  const stripe = createStripeClient();

  if (!stripe) {
    throw createError('Unexpected error happen!');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.floor(order.grandTotal * 100),
    currency: 'usd',
    payment_method_types: ['card'],
    receipt_email: order.email,
    shipping: {
      name: order.fullname || order.email!,
      address: {
        line1: order.shippingAddress,
      },
      phone: order.phone,
    },
    metadata: {
      orderId: order._id!.toString(),
      orderNumber: order.orderNumber,
    },
  });

  return paymentIntent.client_secret;
};

export default createStripeClient;
export { createPaymentIntent };
