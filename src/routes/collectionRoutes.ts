import express from 'express';
import { validateRequest } from 'yup-schemas';
import { requireLogin, requireRole } from 'express-common-middlewares';

//
import collectionSchema from '../yup/collectionSchema';
import * as collectionController from '../controllers/collectionController';
import { User } from '../models/userModel';

const router = express.Router();

router.get(
  '/:id',
  validateRequest(collectionSchema),
  collectionController.getCollection,
);

router.get(
  '/',
  validateRequest(collectionSchema),
  collectionController.getManyCollections,
);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.post(
  '/',
  validateRequest(collectionSchema),
  collectionController.createCollection,
);

router.put(
  '/:id',
  validateRequest(collectionSchema),
  collectionController.updateCollection,
);

router.put(
  '/',
  validateRequest(collectionSchema),
  collectionController.updateManyCollections,
);

router.delete(
  '/:id',
  validateRequest(collectionSchema),
  collectionController.deleteCollection,
);
router.delete(
  '/',
  validateRequest(collectionSchema),
  collectionController.deleteManyCollections,
);

export default router;
