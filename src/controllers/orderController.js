const { createPaymentIntent } = require('../config/stripe');
const { Order } = require('../models/orderModel');
const { Product } = require('../models/productModel');
const { Shipping } = require('../models/shippingModel');
const { getCouponStatus } = require('./couponController');

const createOrder = async (req, res, next) => {
  let { items, ...payload } = req.body;

  items = await Product.populate(items, {
    path: 'product',
    select: 'name price slug variants',
  });

  const { success, message, items: updatedItems } = getItemPrices(items);

  if (!success) {
    return res.status(404).json({
      status: 'fail',
      message,
    });
  }

  const { notes, phone, email, fullname, shippingAddress, couponCode } =
    payload;

  const orderInfo = await getOrderInfo(items, payload);

  const orderDetail = {
    orderNumber: randomOrderNumber(100000, 999999),
    subTotal: orderInfo.subTotal,
    grandTotal: orderInfo.grandTotal,
    items,
    shippingInfo: {
      fullname,
      email,
      phone,
      address: {
        line1: shippingAddress,
      },
      notes,
    },
    shippingMethod: orderInfo.shipping,
    discount: {
      inDollar: orderInfo.discountInDollar,
      inPercent: orderInfo.discountInPercent,
      couponCode,
    },
  };

  const order = await Order.create(orderDetail);

  await createPaymentIntent(res, order);
};

const getOrderInfo = async (items, payload) => {
  const { couponCode, shippingMethod } = payload;

  const subTotal = items.reduce((total, item) => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    return total + itemTotal;
  }, 0);

  const { discountInPercent, discountInDollar } = await getCouponStatus(
    couponCode,
    subTotal,
  );

  const shipping = await Shipping.findById(shippingMethod).select(
    '_id dislay_name delivery_min delivery_max delivery_min_unit delivery_max_unit fees',
  );

  if (shipping.freeshipOrderOver && subTotal > shipping.freeshipOrderOver) {
    shipping.fees = 0;
  }

  const grandTotal = subTotal - discountInDollar + shipping.fees;

  return {
    subTotal,
    grandTotal,
    shipping,
    discountInPercent,
    discountInDollar,
    couponCode,
  };
};

const randomOrderNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// get price for item based on their selected variants & options
const getItemPrices = (items) => {
  for (let i = 0; i < items.length; i++) {
    const allOptions = getAllOptions(items[i]);
    const selectedOptions = items[i].options.map((id) => allOptions[id]);

    if (selectedOptions.length !== items[i].options.length) {
      return {
        success: false,
        message: 'Can not find option belong to product! Try again later!',
      };
    }

    items[i].options = selectedOptions;

    const { highestPrice, optionImage } =
      getOptionImageAndPrice(selectedOptions);

    if (highestPrice > 0) {
      items[i].product.price = highestPrice;
    }

    if (optionImage) {
      items[i].product.images = [optionImage];
    }

    const oldItem = JSON.parse(JSON.stringify(items[i]));

    items[i] = {
      ...oldItem.product,
      options: selectedOptions,
      quantity: items[i].quantity,
      variants: undefined,
    };
  }

  return { success: true, items };
};

const getOptionImageAndPrice = (options) => {
  let highestPrice = 0;
  let optionImage = null;

  options.forEach((option) => {
    if (option.price && option.price > highestPrice) {
      highestPrice = option.price;
    }

    if (option.photo) optionImage = option.photo;
  });

  return { highestPrice, optionImage };
};

const getAllOptions = (item) => {
  const { product } = item;

  const optionsObj = {};

  product.variants.forEach((variant) => {
    variant.options.forEach((option) => {
      optionsObj[option.id] = {
        ...option.toObject(),
        variantName: variant.variantName,
      };
    });
  });

  return optionsObj;
};

const getOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find order with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
};

const getManyOrders = async (req, res, next) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 10,
    filter,
  } = req.query;

  // 0. check how many result
  const matchingResults = await Order.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Order.find(filter);

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
  const orders = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      currentPage: page,
      results: orders.length,
      totalPages,
      itemsPerPage,
      totalResults: matchingResults,
    },
    data: orders,
  });
};

const updateOrder = async (req, res, next) => {
  // TODO: need to destruct this body
  const body = req.body;

  const order = await Order.findByIdAndUpdate({ _id: req.params.id }, body, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find order with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
};

const updateManyOrders = async (req, res, next) => {
  // TODO: need to destruct payload
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Order.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find order with provided ids',
    });
  }

  const { modifiedCount } = await Order.updateMany(
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
      message: 'your orders may be updated or not!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteOrder = async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find order with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your order',
  });
};

const deleteManyOrders = async (req, res, next) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Order.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find orders with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted orders',
    deletedCount,
  });
};

module.exports = {
  createOrder,
  getOrder,
  getManyOrders,
  updateOrder,
  updateManyOrders,
  deleteOrder,
  deleteManyOrders,
};
