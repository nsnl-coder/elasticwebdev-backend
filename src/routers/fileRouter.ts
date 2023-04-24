import express from 'express';
import { requireLogin, requireRole } from 'express-common-middlewares';
import { validateRequest, requiredFields } from 'yup-schemas';
import * as filesController from '../controllers/fileController';
import { User } from '../models/userModel';
import fileSchema from '../yup/fileSchema';

const router = express.Router();
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

export default router;
