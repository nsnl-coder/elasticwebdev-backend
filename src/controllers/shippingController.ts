import { NextFunction, Request, Response } from 'express';
import { Shipping } from '../models/shippingModel';

const createShipping = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const shipping = await Shipping.create(req.body);
  res.status(201).json({ status: 'success', data: shipping });
};

const getShipping = async (req: Request, res: Response, next: NextFunction) => {
  const shipping = await Shipping.findById(req.params.id);

  if (!shipping) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find shipping with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: shipping,
  });
};

const getManyShippings = async (
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
  const matchingResults = await Shipping.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Shipping.find(filter);

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
  const shippings = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      currentPage: page,
      results: shippings.length,
      totalPages,
      itemsPerPage,
      totalResults: matchingResults,
    },
    data: shippings,
  });
};

const updateShipping = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const shipping = await Shipping.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!shipping) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find shipping with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: shipping,
  });
};

const updateManyShippings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Shipping.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find shipping with provided ids',
    });
  }

  const { modifiedCount } = await Shipping.updateMany(
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
      message: 'your shippings may be updated or not!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteShipping = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  const shipping = await Shipping.findByIdAndDelete(id);

  if (!shipping) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find shipping with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your shipping',
  });
};

const deleteManyShippings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Shipping.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find shippings with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted shippings',
    deletedCount,
  });
};

export {
  createShipping,
  getShipping,
  getManyShippings,
  updateShipping,
  updateManyShippings,
  deleteShipping,
  deleteManyShippings,
};
