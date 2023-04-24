import { NextFunction, Request, Response } from 'express';
import { Product } from '../models/productModel';

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const product = await Product.create(req.body);
  res.status(201).json({ status: 'success', data: product });
};

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
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

const getManyProducts = async (
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
  query = query.sort(`-isPinned ${sort}`);

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
    pagination: {
      currentPage: page,
      results: products.length,
      totalPages,
      itemsPerPage,
      totalResults: matchingResults,
    },
    data: products,
  });
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

const updateManyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  const { modifiedCount } = await Product.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    payload,
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

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

const deleteManyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

export {
  createProduct,
  getProduct,
  getManyProducts,
  updateProduct,
  updateManyProducts,
  deleteProduct,
  deleteManyProducts,
};
