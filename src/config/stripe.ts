import Stripe from 'stripe';
import type { Response } from 'express';
import { IOrder } from '../yup/orderSchema';

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
    throw new Error('Unexpected error happen');
    return;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.grandTotal * 100,
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
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
  });

  res.status(200).send({
    status: 'success',
    data: {
      client_secret: paymentIntent.client_secret,
    },
  });
};

export default createStripeClient;
export { createPaymentIntent };
