const { Order } = require('../models/orderModel');

const createOrder = async (req, res, next) => {
  const { items, orderNotes, discountCode } = req.body;

  const order = await Order.create(body);

  // step 1: populate all the products in items

  // step 2: transform the data to stripe wanted data
  res.status(201).json({ status: 'success', data: order });

  // step 3: create a checkout session and return checkout url
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
