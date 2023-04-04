const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const {
  requireLogin,
  requireRole,
  checkIdExistence,
} = require('express-common-middlewares');
//
const ratingSchema = require('../yup/ratingSchema');
const ratingController = require('../controllers/ratingController');
const { User } = require('../models/userModel');
const { Product } = require('../models/productModel');

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
  ratingController.updateRating,
);

router.delete(
  '/:id',
  validateRequest(ratingSchema),
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

module.exports = router;
