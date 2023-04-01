const express = require('express');

const router = express.Router();

// #insert__routers
router.use('/api/products', require('./productRoutes.js'));
router.use('/api/variants', require('./variantRoutes.js'));
router.use('/api/collections', require('./collectionRoutes.js'));

router.use('/api/users', require('./userRoutes'));

module.exports = router;
