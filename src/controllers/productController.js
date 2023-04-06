const { Product } = require('../models/productModel');

const createProduct = async (req, res, next) => {
  const {
    name,
    status,
    overview,
    description,
    isPinned,
    price,
    discountPrice,
    images,
    previewImages,
    variants,
    collections,
  } = req.body;

  const product = await Product.create({
    name,
    status,
    overview,
    description,
    isPinned,
    price,
    discountPrice,
    images,
    previewImages,
    variants,
    collections,
  });

  res.status(201).json({ status: 'success', data: product });
};

const getProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find product with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
};

const getManyProducts = async (req, res, next) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 20,
    filter,
  } = req.query;

  // 0. check how many result
  const matchingResults = await Product.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Product.find(filter);

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
  const products = await query;

  res.status(200).json({
    status: 'success',
    data: products,
    pagination: {
      currentPage: page,
      results: products.length,
      totalPages,
      totalResults: matchingResults,
    },
  });
};

const updateProduct = async (req, res, next) => {
  // TODO: need to destruct this body
  const {
    name,
    status,
    overview,
    description,
    isPinned,
    price,
    discountPrice,
    images,
    previewImages,
    variants,
    collections,
  } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      status,
      overview,
      description,
      isPinned,
      price,
      discountPrice,
      images,
      previewImages,
      variants,
      collections,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find product with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
};

const updateManyProducts = async (req, res, next) => {
  // TODO: need to destruct payload
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Product.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find product with provided ids',
    });
  }

  const {
    name,
    status,
    overview,
    description,
    isPinned,
    price,
    discountPrice,
    images,
    previewImages,
    variants,
    collections,
  } = payload;

  const { modifiedCount } = await Product.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    {
      name,
      status,
      overview,
      description,
      isPinned,
      price,
      discountPrice,
      images,
      previewImages,
      variants,
      collections,
    },
  );

  if (modifiedCount !== updateList.length) {
    return res.status(400).json({
      status: 'fail',
      message: 'Something went wrong!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteProduct = async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find product with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your product',
  });
};

const deleteManyProducts = async (req, res, next) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Product.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find products with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted products',
    deletedCount,
  });
};

module.exports = {
  createProduct,
  getProduct,
  getManyProducts,
  updateProduct,
  updateManyProducts,
  deleteProduct,
  deleteManyProducts,
};
