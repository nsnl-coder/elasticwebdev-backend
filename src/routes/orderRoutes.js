const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const { requireLogin, requireRole } = require('express-common-middlewares');
//
const orderSchema = require('../yup/orderSchema');
const orderController = require('../controllers/orderController');
const { User } = require('../models/userModel');

const router = express.Router();

// TODO: apply 2 below middlewares to correct place
router.use(requireLogin(User));
router.use(requireRole('admin'));

router.get('/:id', validateRequest(orderSchema), orderController.getOrder);
router.get('/', validateRequest(orderSchema), orderController.getManyOrders);

router.post(
  '/',
  // TODO: FIX THIS REQUIRED FIELD
  // requiredFields('edit-this'),
  validateRequest(orderSchema),
  orderController.createOrder,
);

router.put('/:id', validateRequest(orderSchema), orderController.updateOrder);
router.put('/', validateRequest(orderSchema), orderController.updateManyOrders);

router.delete('/:id', validateRequest(orderSchema), orderController.deleteOrder);
router.delete('/', validateRequest(orderSchema), orderController.deleteManyOrders);

module.exports = router;
