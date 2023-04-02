const express = require('express');
const { requiredFields, validateRequest } = require('yup-schemas');
const { requireLogin } = require('express-common-middlewares');

//
const { User } = require('../models/userModel');
const userController = require('../controllers/userController');
const userSchema = require('../yup/userSchema');

const router = express.Router();

router.post('/sign-out', userController.signOut);

router.post(
  '/sign-up',
  requiredFields('email', 'password', 'fullname'),
  validateRequest(userSchema),
  userController.signUp,
);

/**
 * handle email verification
 */
router.post('/verify-email/:token', userController.verifyEmail);

/**
 * request verification email again
 */
router.post(
  '/resend-verify-email',
  requiredFields('email'),
  validateRequest(userSchema),
  userController.resendVerifyEmail,
);

/**
 * use to request a reset password email
 */
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

router.get('/current-user', userController.getCurrentUser);

module.exports = router;
