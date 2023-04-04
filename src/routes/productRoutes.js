const express = require('express');
const { validateRequest } = require('yup-schemas');
const {
  requireLogin,
  requireRole,
  checkIdExistence,
} = require('express-common-middlewares');

//
const productSchema = require('../yup/productSchema');
const productController = require('../controllers/productController');
const { User } = require('../models/userModel');
const { Collection } = require('../models/collectionModel');
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

module.exports = router;
