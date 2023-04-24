import { NextFunction, Request, Response } from 'express';
import createStripeClient from '../config/stripe';
import Stripe from 'stripe';

export interface StripeRequest extends Request {
  event?: Stripe.Event;
}

const validateStripeSignature = (
  req: StripeRequest,
  res: Response,
  next: NextFunction,
) => {
  const stripe = createStripeClient();

  if (!stripe) {
    throw new Error('Unexpected error happen');
  }

  const endpointSecret = process.env.ENDPOINT_SECRET;
  const signature = req.headers['stripe-signature'];

  if (!signature || !endpointSecret) {
    throw Error('Unexpected error');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      endpointSecret,
    );

    req.event = event;
    next();
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default validateStripeSignature;
