const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = (items, discount, shippings) => {};

module.exports = { stripe };
