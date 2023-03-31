const express = require('express');

const router = express.Router();

// #insert__routers

router.use('/api/users', require('./userRoutes'));

module.exports = router;
