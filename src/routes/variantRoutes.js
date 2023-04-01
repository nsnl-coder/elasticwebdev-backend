const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const requireLogin = require('../middlewares/requireLogin');
const requireRole = require('../middlewares/requireRole');

const variantSchema = require('../yup/variantSchema');
const variantController = require('../controllers/variantController');

const router = express.Router();

router.use(requireLogin);
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
