import { Coupon } from '../models/couponModel';
import { NextFunction, Request, Response } from 'express';

interface InvalidStatus {
  couponStatus: 'invalid' | 'valid';
  statusCode: 200 | 400 | 404;
  discountInDollar: number;
  discountInPercent: number;
  message?: string;
}

interface CouponStatus {
  couponStatus: 'valid';
  statusCode: 200;
  discountInDollar: number;
  discountInPercent: number;
  isFreeshipping: boolean;
  discountUnit: string;
}

const getCouponStatus = async (
  couponCode: string | undefined,
  orderTotal: number,
): Promise<InvalidStatus | CouponStatus> => {
  const invalidStatus: InvalidStatus = {
    couponStatus: 'invalid',
    statusCode: 400,
    discountInDollar: 0,
    discountInPercent: 0,
  };

  if (!couponCode || !orderTotal) {
    invalidStatus.message = 'Please provide coupon code and order total';
    return invalidStatus;
  }
  const coupon = await Coupon.findOne({ couponCode });

  if (!coupon) {
    invalidStatus.message = 'Cannot find coupon with provided coupon code';
    invalidStatus.statusCode = 404;
    return invalidStatus;
  }

  if (coupon.isExpired) {
    invalidStatus.message = 'Your coupon code is expired';
    invalidStatus.statusCode = 400;
    return invalidStatus;
  }

  if (coupon.zeroCouponsLeft) {
    invalidStatus.message = 'All coupons have been used';
    return invalidStatus;
  }

  if (coupon.minimumOrder && orderTotal < coupon.minimumOrder) {
    invalidStatus.message = `Your order must be at least $${coupon.minimumOrder} to use this coupon`;
    return invalidStatus;
  }

  if (coupon.maximumOrder && orderTotal > coupon.maximumOrder) {
    invalidStatus.message = `Your order cannot exceed $${coupon.maximumOrder} to use this coupon`;
    return invalidStatus;
  }

  if (
    coupon.discountAmount &&
    coupon.discountUnit === '$' &&
    orderTotal < coupon.discountAmount
  ) {
    invalidStatus.message = `Add more items to your cart to get a discount of $${coupon.discountAmount}`;
    return invalidStatus;
  }

  const couponStatus: CouponStatus = {
    couponStatus: 'valid',
    statusCode: 200,
    discountInDollar: 0,
    discountInPercent: 0,
    isFreeshipping: coupon.isFreeshipping || false,
    discountUnit: coupon.discountUnit || '$',
  };

  if (coupon.discountUnit === '$') {
    couponStatus.discountInDollar = coupon.discountAmount || 0;
    couponStatus.discountInPercent =
      Math.round((coupon.discountAmount! / orderTotal) * 10000) / 100;
  }

  if (coupon.discountUnit === '%') {
    couponStatus.discountInPercent = coupon.discountAmount || 0;
    couponStatus.discountInDollar = (coupon.discountAmount! * orderTotal) / 100;
  }

  return couponStatus;
};

const getCouponValidity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { orderTotal, couponCode } = req.body;

  const couponStatus = await getCouponStatus(couponCode, orderTotal);

  if (couponStatus.couponStatus === 'invalid') {
    res.status(couponStatus.statusCode).json({
      status: 'fail',
      message: couponStatus.message,
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: couponStatus,
  });
};

const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ status: 'success', data: coupon });
};

const getCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find coupon with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: coupon,
  });
};

const getManyCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 10,
    filter,
  } = req.query;

  // 0. check how many result
  const matchingResults = await Coupon.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Coupon.find(filter);

  // 2. sorting
  query = query.sort(sort);

  // 3. limit fields
  if (fields) {
    query = query.select(fields);
  }

  // 4. pagination
  const skip = (page - 1) * itemsPerPage;
  const limit = itemsPerPage;

  query = query.skip(skip).limit(limit);

  // 5. finally await query
  const coupons = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      currentPage: page,
      results: coupons.length,
      totalPages,
      itemsPerPage,
      totalResults: matchingResults,
    },
    data: coupons,
  });
};

const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const coupon = await Coupon.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!coupon) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find coupon with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: coupon,
  });
};

const updateManyCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Coupon.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find coupon with provided ids',
    });
  }

  const { modifiedCount } = await Coupon.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    payload,
    {
      runValidators: true,
    },
  );

  if (modifiedCount !== updateList.length) {
    return res.status(400).json({
      status: 'unknown',
      message: 'your coupons may be updated or not!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;
  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find coupon with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your coupon',
  });
};

const deleteManyCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Coupon.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find coupons with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted coupons',
    deletedCount,
  });
};

export {
  createCoupon,
  getCoupon,
  getManyCoupons,
  updateCoupon,
  updateManyCoupons,
  deleteCoupon,
  deleteManyCoupons,
  getCouponValidity,
  //
  getCouponStatus,
};
