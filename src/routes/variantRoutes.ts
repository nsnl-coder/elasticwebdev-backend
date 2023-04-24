import express from 'express';
import { validateRequest, requiredFields } from 'yup-schemas';

//
import { User } from '../models/userModel';
import variantSchema from '../yup/variantSchema';
import * as variantController from '../controllers/variantController';
import { requireLogin, requireRole } from 'express-common-middlewares';

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

export default router;
