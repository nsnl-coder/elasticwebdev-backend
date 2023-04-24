import express from 'express';
import { validateRequest, requiredFields } from 'yup-schemas';
import { requireLogin, requireRole } from 'express-common-middlewares';
//
import contactSchema from '../yup/contactSchema';
import * as contactController from '../controllers/contactController';
import { User } from '../models/userModel';

const router = express.Router();

router.post(
  '/',
  requiredFields('email', 'phone', 'fullname', 'subject', 'content'),
  validateRequest(contactSchema),
  contactController.createContact,
);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.get(
  '/:id',
  validateRequest(contactSchema),
  contactController.getContact,
);
router.get(
  '/',
  validateRequest(contactSchema),
  contactController.getManyContacts,
);

router.put(
  '/:id',
  validateRequest(contactSchema),
  contactController.updateContact,
);
router.put(
  '/',
  validateRequest(contactSchema),
  contactController.updateManyContacts,
);

router.delete(
  '/:id',
  validateRequest(contactSchema),
  contactController.deleteContact,
);
router.delete(
  '/',
  validateRequest(contactSchema),
  contactController.deleteManyContacts,
);

export default router;
