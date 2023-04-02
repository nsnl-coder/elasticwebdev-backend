const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');

//
const { User } = require('../models/userModel');
const variantSchema = require('../yup/variantSchema');
const variantController = require('../controllers/variantController');
const { requireLogin, requireRole } = require('express-common-middlewares');

const router = express.Router();

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.get(
  '/:id',
  validateRequest(variantSchema),
  variantController.getVariant,
);
router.get(
  '/',
  validateRequest(variantSchema),
  variantController.getManyVariants,
);

router.post(
  '/',
  requiredFields('options'),
  validateRequest(variantSchema),
  variantController.createVariant,
);

router.put(
  '/:id',
  validateRequest(variantSchema),
  variantController.updateVariant,
);
router.put(
  '/',
  validateRequest(variantSchema),
  variantController.updateManyVariants,
);

router.delete(
  '/:id',
  validateRequest(variantSchema),
  variantController.deleteVariant,
);
router.delete(
  '/',
  validateRequest(variantSchema),
  variantController.deleteManyVariants,
);

module.exports = router;
