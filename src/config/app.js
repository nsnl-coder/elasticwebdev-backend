const express = require('express');
const handler = require('express-async-errors'); // error handler for async middleware
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const { globalErrorHandler, routeNotFound } = require('express-common-middlewares');
//
const indexRouter = require('../routes/index');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_HOST, credentials: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.use('/', indexRouter);

app.use(routeNotFound);
app.use(globalErrorHandler);


const PORT = process.env.PORT || 5000;
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log('App running on port ' + PORT);
  });
}

module.exports = { server, app };
