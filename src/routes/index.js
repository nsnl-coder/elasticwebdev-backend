const express = require('express');

const router = express.Router();

// #insert__routers
router.use("/api/menus",require("./menuRoutes.js"))
router.use("/api/ratings",require("./ratingRoutes.js"))
router.use("/api/contacts",require("./contactRoutes.js"))
router.use("/api/shippings",require("./shippingRoutes.js"))
router.use('/api/coupons', require('./couponRoutes.js'));
router.use('/api/orders', require('./orderRoutes.js'));
router.use('/api/products', require('./productRoutes.js'));
router.use('/api/variants', require('./variantRoutes.js'));
router.use('/api/collections', require('./collectionRoutes.js'));

router.use('/api/users', require('./userRoutes'));

module.exports = router;
