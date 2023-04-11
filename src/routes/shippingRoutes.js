const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const { requireLogin, requireRole } = require('express-common-middlewares');
//
const shippingSchema = require('../yup/shippingSchema');
const shippingController = require('../controllers/shippingController');
const { User } = require('../models/userModel');

const router = express.Router();

router.get(
  '/',
  validateRequest(shippingSchema),
  shippingController.getManyShippings,
);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.get(
  '/:id',
  validateRequest(shippingSchema),
  shippingController.getShipping,
);

router.post(
  '/',
  validateRequest(shippingSchema),
  shippingController.createShipping,
);

router.put(
  '/:id',
  validateRequest(shippingSchema),
  shippingController.updateShipping,
);
router.put(
  '/',
  validateRequest(shippingSchema),
  shippingController.updateManyShippings,
);

router.delete(
  '/:id',
  validateRequest(shippingSchema),
  shippingController.deleteShipping,
);
router.delete(
  '/',
  validateRequest(shippingSchema),
  shippingController.deleteManyShippings,
);

module.exports = router;
