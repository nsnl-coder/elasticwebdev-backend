import express from 'express';
import { requiredFields, validateRequest } from 'yup-schemas';
import { requireLogin } from 'express-common-middlewares';

//
import { User } from '../models/userModel';
import * as authController from '../controllers/authController';
import userSchema from '../yup/userSchema';

const router = express.Router();

router.post('/sign-out', authController.signOut);

router.post(
  '/sign-up',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  authController.signUp,
);

/**
 * handle email verification
 */
router.post('/verify-email/:token', authController.verifyEmail);

router.post(
  '/forgot-password',
  requiredFields('email'),
  validateRequest(userSchema),
  authController.forgotPassword,
);

router.put(
  '/reset-password/:token',
  requiredFields('password'),
  validateRequest(userSchema),
  authController.resetPassword,
);

router.post(
  '/sign-in',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  authController.signIn,
);

//
router.get(
  '/current-user',
  requireLogin(User, false),
  authController.getCurrentUser,
);

router.post(
  '/resend-verify-email',
  requireLogin(User, false),
  authController.resendVerifyEmail,
);

// verified logged in user only
router.use(requireLogin(User));

router.put(
  '/update-email',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  authController.updateEmail,
);

router.put(
  '/update-password',
  requiredFields('oldPassword', 'password'),
  validateRequest(userSchema),
  authController.updatePassword,
);

router.put(
  '/update-user-info',
  validateRequest(userSchema),
  authController.updateUserInfo,
);

export default router;
