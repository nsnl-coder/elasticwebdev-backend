const express = require('express');
const { validateRequest, requiredFields } = require('yup-schemas');
const { requireLogin, requireRole } = require('express-common-middlewares');
//
const contactSchema = require('../yup/contactSchema');
const contactController = require('../controllers/contactController');
const { User } = require('../models/userModel');

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

module.exports = router;
