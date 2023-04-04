const dotenv = require('dotenv');
dotenv.config();
require('./utils/email');

// require express app
const { server } = require('./config/app');

// require db
const db = require('./config/db');
db();
