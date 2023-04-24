import express from 'express';
import { validateRequest, requiredFields } from 'yup-schemas';
import { requireLogin, requireRole } from 'express-common-middlewares';
//
import shippingSchema from '../yup/shippingSchema';
import * as shippingController from '../controllers/shippingController';
import { User } from '../models/userModel';

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
  requiredFields('fees'),
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

export default router;
