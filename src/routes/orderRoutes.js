const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const {
  requireLogin,
  requireRole,
  requireOwnership,
} = require('express-common-middlewares');
//
const orderSchema = require('../yup/orderSchema');
const orderController = require('../controllers/orderController');
const { User } = require('../models/userModel');
const { Order } = require('../models/orderModel');

const router = express.Router();

router.use(requireLogin(User));

router.get(
  '/:id',
  validateRequest(orderSchema),
  requireOwnership(Order),
  orderController.getOrder,
);

router.post(
  '/',
  requiredFields(
    'items',
    'fullname',
    'email',
    'phone',
    'shippingAddress',
    'shippingOptions',
  ),
  validateRequest(orderSchema),
  orderController.createOrder,
);

router.use(requireRole('admin'));
router.get('/', validateRequest(orderSchema), orderController.getManyOrders);

router.put('/:id', validateRequest(orderSchema), orderController.updateOrder);
router.put('/', validateRequest(orderSchema), orderController.updateManyOrders);

router.delete(
  '/:id',
  validateRequest(orderSchema),
  orderController.deleteOrder,
);
router.delete(
  '/',
  validateRequest(orderSchema),
  orderController.deleteManyOrders,
);

module.exports = router;
