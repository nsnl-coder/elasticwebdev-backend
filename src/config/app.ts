import express, { Response } from 'express';
import 'express-async-errors'; // error handler for async middleware
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import { routeNotFound } from 'express-common-middlewares';

import indexRouter from '../routers/index';
import { StripeRequest } from '../middlewares/validateStripeSignature';
import globalErrorHandler from '../middlewares/globalErrorHandler';

const app = express();

const whitelist = [process.env.FRONTEND_HOST, process.env.ADMIN_HOST];

const checkOrigin = (
  origin: any,
  callback: (error: Error | null, staticOrigin?: any) => void,
) => {
  if (whitelist.indexOf(origin) !== -1) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

if (process.env.NODE_ENV !== 'test') {
  app.use(cors({ origin: checkOrigin, credentials: true }));
} else {
  app.use(cors());
}

if (process.env.NODE_ENV === 'dev') {
  app.use(logger('dev'));
}

app.use(
  bodyParser.json({
    verify: function (req: StripeRequest, res: Response, buf) {
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

//
app.use(routeNotFound);
app.use(globalErrorHandler);

export { app };
export default routeNotFound;
