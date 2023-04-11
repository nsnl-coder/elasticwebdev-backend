const { getCouponStatus } = require('../controllers/couponController');
const { Order } = require('../models/orderModel');
const { Shipping } = require('../models/shippingModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (res, order) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.grandTotal * 100,
    currency: 'usd',
    payment_method_types: ['card'],
    receipt_email: order.shippingInfo.email,
    shipping: {
      name: order.shippingInfo.fullname,
      address: {
        line1: order.shippingInfo.address.line1,
      },
      phone: order.shippingInfo.phone,
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

module.exports = { stripe, createPaymentIntent };
