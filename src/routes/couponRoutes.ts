import express from 'express';
import { validateRequest, requiredFields } from 'yup-schemas';
import { requireLogin, requireRole } from 'express-common-middlewares';
//
import couponSchema from '../yup/couponSchema';
import * as couponController from '../controllers/couponController';
import { User } from '../models/userModel';

const router = express.Router();

router.get('/:id', validateRequest(couponSchema), couponController.getCoupon);
router.post(
  '/get-coupon-validity',
  requiredFields('orderTotal', 'couponCode'),
  couponController.getCouponValidity,
);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.get('/', validateRequest(couponSchema), couponController.getManyCoupons);

router.post(
  '/',
  requiredFields(
    'couponCode',
    'discountUnit',
    'discountAmount',
    'couponQuantity',
  ),
  validateRequest(couponSchema),
  couponController.createCoupon,
);

router.put(
  '/:id',
  validateRequest(couponSchema),
  couponController.updateCoupon,
);
router.put(
  '/',
  validateRequest(couponSchema),
  couponController.updateManyCoupons,
);

router.delete(
  '/:id',
  validateRequest(couponSchema),
  couponController.deleteCoupon,
);
router.delete(
  '/',
  validateRequest(couponSchema),
  couponController.deleteManyCoupons,
);

export default router;
