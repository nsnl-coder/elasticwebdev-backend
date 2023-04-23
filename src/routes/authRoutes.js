const express = require('express');
const { requiredFields, validateRequest } = require('yup-schemas');
const { requireLogin } = require('express-common-middlewares');

//
const { User } = require('../models/userModel');
const userController = require('../controllers/authController');
const userSchema = require('../yup/userSchema');

const router = express.Router();

router.post('/sign-out', userController.signOut);

router.post(
  '/sign-up',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  userController.signUp,
);

/**
 * handle email verification
 */
router.post('/verify-email/:token', userController.verifyEmail);

router.post(
  '/forgot-password',
  requiredFields('email'),
  validateRequest(userSchema),
  userController.forgotPassword,
);

router.put(
  '/reset-password/:token',
  requiredFields('password'),
  validateRequest(userSchema),
  userController.resetPassword,
);

router.post(
  '/sign-in',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  userController.signIn,
);

//
router.get(
  '/current-user',
  requireLogin(User, false),
  userController.getCurrentUser,
);

router.post(
  '/resend-verify-email',
  requireLogin(User, false),
  userController.resendVerifyEmail,
);

// verified logged in user only
router.use(requireLogin(User));

router.put(
  '/update-email',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  userController.updateEmail,
);

router.put(
  '/update-password',
  requiredFields('oldPassword', 'password'),
  validateRequest(userSchema),
  userController.updatePassword,
);

router.put(
  '/update-user-info',
  validateRequest(userSchema),
  userController.updateUserInfo,
);

module.exports = router;
