const dotenv = require('dotenv');
dotenv.config();
require('./utils/email');

// require db
const db = require('./config/db');
db();

// require express app
require('./config/app');
