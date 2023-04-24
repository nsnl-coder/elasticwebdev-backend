import express from 'express';
import { validateRequest, requiredFields } from 'yup-schemas';
import {
  requireLogin,
  requireRole,
  checkIdExistence,
  requireOwnership,
} from 'express-common-middlewares';
//
import ratingSchema from '../yup/ratingSchema';
import * as ratingController from '../controllers/ratingController';
import { User } from '../models/userModel';
import { Product } from '../models/productModel';
import { Rating } from '../models/ratingModel';

const router = express.Router();

router.use(requireLogin(User));

router.post(
  '/',
  requiredFields('stars', 'product', 'content'),
  validateRequest(ratingSchema),
  checkIdExistence('product', Product),
  ratingController.createRating,
);

router.put(
  '/:id',
  validateRequest(ratingSchema),
  requireOwnership(Rating),
  ratingController.updateRating,
);

router.delete(
  '/:id',
  validateRequest(ratingSchema),
  requireOwnership(Rating),
  ratingController.deleteRating,
);

// admin
router.use(requireRole('admin'));

router.get('/:id', validateRequest(ratingSchema), ratingController.getRating);
router.get('/', validateRequest(ratingSchema), ratingController.getManyRatings);

router.put(
  '/',
  validateRequest(ratingSchema),
  ratingController.updateManyRatings,
);

router.delete(
  '/',
  validateRequest(ratingSchema),
  ratingController.deleteManyRatings,
);

export default router;
