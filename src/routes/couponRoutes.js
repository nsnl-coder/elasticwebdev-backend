const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const { requireLogin, requireRole } = require('express-common-middlewares');
//
const couponSchema = require('../yup/couponSchema');
const couponController = require('../controllers/couponController');
const { User } = require('../models/userModel');

const router = express.Router();

// TODO: apply 2 below middlewares to correct place

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

module.exports = router;
