import express from 'express';
import stripeRouter from './stripeRouter';
import fileRouter from './fileRouter';
import menuRouter from './menuRouter';
import ratingRouter from './ratingRouter';
import contactRouter from './contactRouter';
import shippingRouter from './shippingRouter';
import couponRouter from './couponRouter';
import orderRouter from './orderRouter';
import productRouter from './productRouter';
import variantRouter from './variantRouter';
import collectionRouter from './collectionRouter';
import authRouter from './authRouter';

const router = express.Router();

// #insert__routers
router.use('/api/stripe', stripeRouter);
router.use('/api/files', fileRouter);
router.use('/api/menus', menuRouter);
router.use('/api/ratings', ratingRouter);
router.use('/api/contacts', contactRouter);
router.use('/api/shippings', shippingRouter);
router.use('/api/coupons', couponRouter);
router.use('/api/orders', orderRouter);
router.use('/api/products', productRouter);
router.use('/api/variants', variantRouter);
router.use('/api/collections', collectionRouter);
router.use('/api/auth', authRouter);

export default router;
