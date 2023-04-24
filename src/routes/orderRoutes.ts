import express from 'express';
import { validateRequest, requiredFields } from 'yup-schemas';
import {
  requireLogin,
  requireRole,
  requireOwnership,
  checkIdExistence,
} from 'express-common-middlewares';
//
import orderSchema from '../yup/orderSchema';
import * as orderController from '../controllers/orderController';
import { User } from '../models/userModel';
import { Order } from '../models/orderModel';
import { Shipping } from '../models/shippingModel';

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
    'phone',
    'fullname',
    'shippingAddress',
    'email',
    'shippingMethod',
  ),
  validateRequest(orderSchema),
  checkIdExistence('shippingOption', Shipping),
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

export default router;
