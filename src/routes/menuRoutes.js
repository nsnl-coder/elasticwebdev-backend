const express = require('express');
const { validateRequest } = require('yup-schemas');
const {
  requireLogin,
  requireRole,
  checkIdExistence,
} = require('express-common-middlewares');
//
const menuSchema = require('../yup/menuSchema');
const menuController = require('../controllers/menuController');
const { User } = require('../models/userModel');
const { Menu } = require('../models/menuModel');

const router = express.Router();

router.get('/', validateRequest(menuSchema), menuController.getManyMenus);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.post(
  '/',
  validateRequest(menuSchema),
  checkIdExistence('parentMenu', Menu),
  menuController.createMenu,
);
router.get('/:id', validateRequest(menuSchema), menuController.getMenu);

router.put('/:id', validateRequest(menuSchema), menuController.updateMenu);
router.put('/', validateRequest(menuSchema), menuController.updateManyMenus);
router.delete('/:id', validateRequest(menuSchema), menuController.deleteMenu);
router.delete('/', validateRequest(menuSchema), menuController.deleteManyMenus);

module.exports = router;
