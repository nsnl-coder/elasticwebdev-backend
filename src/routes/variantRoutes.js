const express = require('express');
const { validateRequest } = require('yup-schemas');
const variantController = require('../controllers/variantController');
const variantSchema = require('../yup/variantSchema');
const router = express.Router();

router.post('/', variantController.createVariant);

router.get(
  '/:id',
  validateRequest(variantSchema),
  variantController.getVariant,
);
router.get('/', variantController.getAllVariants);

// only admin can do it from here
router.put('/:id', variantController.updateVariant);
router.put('/', variantController.updateManyVariants);
router.delete('/:id', variantController.deleteVariant);
router.delete('/', variantController.deleteManyVariants);

module.exports = router;
