const { Coupon } = require('../models/couponModel');

const checkCouponStatus = async (res, couponCode, orderTotal) => {
  const coupon = await Coupon.findOne({
    couponCode,
  });

  const invalidStatus = {
    couponStatus: 'invalid',
    statusCode: 400,
    message: undefined,
  };

  if (!coupon) {
    invalidStatus.message = 'Can not find coupon with provided coupon code!';
    invalidStatus.statusCode = 404;
    return invalidStatus;
  }

  // invalid coupon
  if (coupon.isExpired) {
    invalidStatus.message =
      'Your coupon code is expired. Try again with new coupon!';
    invalidStatus.statusCode = 400;

    return invalidStatus;
  }

  if (coupon.zeroCouponsLeft) {
    invalidStatus.message =
      'All coupons have been in used! Try again with different coupon!';

    return invalidStatus;
  }

  if (coupon.minimumOrder && coupon.maximumOrder && orderTotal) {
    if (orderTotal < coupon.minimumOrder) {
      invalidStatus.message = `Your coupon is only valid for order over ${coupon.minimumOrder}$!`;
      return invalidStatus;
    }

    if (orderTotal > coupon.maximumOrder) {
      invalidStatus.message = `Your coupon is only valid for order under ${coupon.maximumOrder}$!`;
      return invalidStatus;
    }
  }

  if (coupon.discountUnit === '$' && orderTotal < coupon.discountAmount) {
    invalidStatus.message = `To get the discount, please add more items until your cart total exceeds ${coupon.discountAmount}$!`;
    return invalidStatus;
  }

  // valid coupon
  const couponStatus = {
    couponStatus: 'valid',
    discountInDollar: 0,
    discountInPercentage: 0,
    isFreeshipping: coupon.isFreeshipping,
    discountUnit: coupon.discountUnit,
  };

  if (coupon.discountUnit === '$') {
    couponStatus.discountInDollar = coupon.discountAmount;
    couponStatus.discountInPercentage =
      Math.round((coupon.discountAmount / orderTotal) * 10000) / 100;
  }

  if (coupon.discountUnit === '%') {
    couponStatus.discountInPercentage = coupon.discountAmount;
    couponStatus.discountInDollar = (coupon.discountAmount * orderTotal) / 100;
  }

  return couponStatus;
};

const getCouponValidity = async (req, res, next) => {
  const { orderTotal, couponCode } = req.body;
  const couponStatus = await checkCouponStatus(res, couponCode, orderTotal);

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

const createCoupon = async (req, res, next) => {
  const {
    couponCode,
    discountUnit,
    discountAmount,
    couponQuantity,
    isFreeshipping,
    minimumOrder,
    maximumOrder,
    startDate,
    endDate,
    status,
  } = req.body;

  const coupon = await Coupon.create({
    couponCode,
    discountUnit,
    discountAmount,
    isFreeshipping,
    minimumOrder,
    maximumOrder,
    couponQuantity,
    startDate,
    endDate,
    status,
  });

  res.status(201).json({ status: 'success', data: coupon });
};

const getCoupon = async (req, res, next) => {
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

const getManyCoupons = async (req, res, next) => {
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

const updateCoupon = async (req, res, next) => {
  const {
    couponCode,
    discountUnit,
    discountAmount,
    couponQuantity,
    isFreeshipping,
    minimumOrder,
    maximumOrder,
    startDate,
    endDate,
    status,
  } = req.body;

  const coupon = await Coupon.findByIdAndUpdate(
    { _id: req.params.id },
    {
      couponCode,
      discountUnit,
      discountAmount,
      couponQuantity,
      isFreeshipping,
      minimumOrder,
      maximumOrder,
      startDate,
      endDate,
      status,
    },
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

const updateManyCoupons = async (req, res, next) => {
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

  const {
    discountUnit,
    discountAmount,
    couponQuantity,
    isFreeshipping,
    minimumOrder,
    maximumOrder,
    startDate,
    endDate,
    status,
  } = payload;

  const { modifiedCount } = await Coupon.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    {
      discountUnit,
      discountAmount,
      isFreeshipping,
      minimumOrder,
      maximumOrder,
      couponQuantity,
      startDate,
      endDate,
      status,
    },
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

const deleteCoupon = async (req, res, next) => {
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

const deleteManyCoupons = async (req, res, next) => {
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

module.exports = {
  createCoupon,
  getCoupon,
  getManyCoupons,
  updateCoupon,
  updateManyCoupons,
  deleteCoupon,
  deleteManyCoupons,
  getCouponValidity,
};
