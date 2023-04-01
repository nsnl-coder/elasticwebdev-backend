const express = require('express');
const { validateRequest } = require('yup-schemas');

//
const requireLogin = require('../middlewares/requireLogin');
const requireRole = require('../middlewares/requireRole');
const validateIdExistence = require('../middlewares/validateIdExistence');
const productSchema = require('../yup/productSchema');
const productController = require('../controllers/productController');

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

router.use(requireLogin);
router.use(requireRole('admin'));

router.post(
  '/',
  validateRequest(productSchema),
  // i'm stopping here to write new package
  validateIdExistence(collection),
  productController.createProduct,
);

router.put(
  '/:id',
  validateRequest(productSchema),
  productController.updateProduct,
);
router.put(
  '/',
  validateRequest(productSchema),
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
