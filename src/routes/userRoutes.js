const express = require('express');
const userController = require('../controllers/userController');
const loggedInUserOnly = require('../middlewares/loggedInUserOnly');
const requiredFields = require('../middlewares/requiredFields');
const validateRequest = require('../middlewares/validateRequest');
const userSchema = require('../yup/userSchema');

const router = express.Router();

router.post(
  '/sign-up',
  requiredFields('email', 'password', 'fullname'),
  validateRequest(userSchema),
  userController.signUp,
);

router.post(
  '/sign-in',
  requiredFields('email', 'password'),
  validateRequest(userSchema),
  userController.signIn,
);

router.use(loggedInUserOnly);

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

router.put('/delete-user', userController.deleteUser);

module.exports = router;
