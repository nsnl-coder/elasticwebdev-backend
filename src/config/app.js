const express = require('express');
const handler = require('express-async-errors'); // error handler for async middleware
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const {
  globalErrorHandler,
  routeNotFound,
} = require('express-common-middlewares');
const dotenv = require('dotenv');

//
const indexRouter = require('../routes/index');
const app = express();

const whitelist = [process.env.FRONTEND_HOST, process.env.ADMIN_HOST];

const origin = (origin, callback) => {
  if (whitelist.indexOf(origin) !== -1) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors({ origin, credentials: true }));

if (process.env.NODE_ENV === 'dev') {
  app.use(logger('dev'));
}

if (process.env.NODE_ENV === 'test') {
  dotenv.config();
}

app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/api/stripe/webhooks')) {
        req.rawBody = buf.toString();
      }
    },
  }),
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '..', '..', 'public')));
app.use('/', indexRouter);
app.use(routeNotFound);
app.use(globalErrorHandler);

module.exports = { app };
