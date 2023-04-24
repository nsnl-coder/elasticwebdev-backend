import express, { NextFunction, Response } from 'express';
import validateStripeSignature, {
  StripeRequest,
} from '../middlewares/validateStripeSignature';
const router = express.Router();

router.post(
  '/webhooks',
  // validateStripeSignature,
  (req: StripeRequest, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
    });
  },
);

export default router;
