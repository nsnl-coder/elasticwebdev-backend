const dotenv = require('dotenv');
dotenv.config();

const {
  onUncaughtException,
  onSigTerm,
  onUnhandledRejection,
} = require('./middlewares/unhandleError');

onUncaughtException();

// require express app
const server = require('./config/app');

// require db
const db = require('./config/db');
db();

// unhandled Error
onSigTerm(server);
onUnhandledRejection(server);
