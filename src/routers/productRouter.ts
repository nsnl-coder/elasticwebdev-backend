import express from 'express';
import { validateRequest } from 'yup-schemas';
import {
  requireLogin,
  requireRole,
  checkIdExistence,
} from 'express-common-middlewares';

//
import productSchema from '../yup/productSchema';
import * as productController from '../controllers/productController';
import { User } from '../models/userModel';
import { Collection } from '../models/collectionModel';
const router = express.Router();

router.get(
  '/:id',
  validateRequest(productSchema),
  productController.getProduct,
);
router.get(
  '/',
  validateRequest(productSchema),
  productController.getManyProducts,
);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.post(
  '/',
  validateRequest(productSchema),
  checkIdExistence('collections', Collection),
  productController.createProduct,
);

router.put(
  '/:id',
  validateRequest(productSchema),
  checkIdExistence('collections', Collection),
  productController.updateProduct,
);
router.put(
  '/',
  validateRequest(productSchema),
  checkIdExistence('collections', Collection),
  productController.updateManyProducts,
);

router.delete(
  '/:id',
  validateRequest(productSchema),
  productController.deleteProduct,
);
router.delete(
  '/',
  validateRequest(productSchema),
  productController.deleteManyProducts,
);

export default router;
