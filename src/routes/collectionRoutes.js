const express = require('express');
const { validateRequest } = require('yup-schemas');
const { requireLogin, requireRole } = require('express-common-middlewares');

//
const collectionSchema = require('../yup/collectionSchema');
const collectionController = require('../controllers/collectionController');
const { User } = require('../models/userModel');

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

module.exports = router;
