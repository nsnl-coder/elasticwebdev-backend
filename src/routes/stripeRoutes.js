const express = require('express');
const validateStripeSignature = require('../middlewares/validateStripeSignature');
const router = express.Router();

router.post('/webhooks', validateStripeSignature, (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
});

module.exports = router;
