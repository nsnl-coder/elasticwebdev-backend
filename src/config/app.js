const express = require('express');
// error handler for async middleware
require('express-async-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
//
const indexRouter = require('../routes/index');
const globalErrorHandler = require('../middlewares/globalErrorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_HOST, credentials: true }));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.use('/', indexRouter);

app.use('*', (req, res, next) => {
  res.status(404).json({ message: 'The route is not defined yet' });
});
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('App running on port ' + PORT);
});

module.exports = server;
