const express = require('express');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/api/users', userRoutes);

module.exports = router;
