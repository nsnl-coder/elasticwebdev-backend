const { stripe } = require('../config/stripe');

const validateStripeSignature = (req, res, next) => {
  const endpointSecret = process.env.ENDPOINT_SECRET;
  const signature = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      endpointSecret,
    );

    req.event = event;
    next();
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = validateStripeSignature;
