import express from 'express';
import { validateRequest } from 'yup-schemas';
import { requireLogin, requireRole } from 'express-common-middlewares';
//
import menuSchema from '../yup/menuSchema';
import * as menuController from '../controllers/menuController';
import { User } from '../models/userModel';
import { Menu } from '../models/menuModel';

const router = express.Router();

router.get('/', validateRequest(menuSchema), menuController.getManyMenus);

router.use(requireLogin(User));
router.use(requireRole('admin'));

router.post('/', validateRequest(menuSchema), menuController.createMenu);

router.get('/:id', validateRequest(menuSchema), menuController.getMenu);

router.put('/:id', validateRequest(menuSchema), menuController.updateMenu);

router.put('/', validateRequest(menuSchema), menuController.updateManyMenus);

router.delete('/:id', validateRequest(menuSchema), menuController.deleteMenu);

router.delete('/', validateRequest(menuSchema), menuController.deleteManyMenus);

export default router;
