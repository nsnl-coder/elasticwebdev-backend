const express = require('express');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const variantRoutes = require('./variantRoutes');

const router = express.Router();

router.use('/api/users', userRoutes);
router.use('/api/products', productRoutes);
router.use('/api/variants', variantRoutes);

module.exports = router;
