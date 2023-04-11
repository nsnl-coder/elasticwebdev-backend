const express = require('express');
const { requireLogin, requireRole } = require('express-common-middlewares');
const { validateRequest, requiredFields } = require('yup-schemas');
const filesController = require('../controllers/fileController');
const router = express.Router();
const { User } = require('../models/userModel');
const fileSchema = require('../yup/fileSchema');

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.post(
  '/presigned-url',
  requiredFields('type', 'size'),
  validateRequest(fileSchema),
  filesController.createPresignedUrl,
);

router.get('/', filesController.getManyFiles);

router.delete('/delete-one-file', filesController.deleteFile);

router.delete(
  '/',
  validateRequest(fileSchema),
  filesController.deleteManyFiles,
);

module.exports = router;
