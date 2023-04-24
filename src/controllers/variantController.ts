import { NextFunction, Request, Response } from 'express';
import { Variant } from '../models/variantModel';

const createVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { variantName, options } = req.body;

  options = options.map((item: any) => ({
    optionName: item.optionName,
    photo: item.photo,
  }));

  const variant = await Variant.create({ variantName, options });
  res.status(201).json({ status: 'success', data: variant });
};

const getVariant = async (req: Request, res: Response, next: NextFunction) => {
  const variant = await Variant.findById(req.params.id);

  if (!variant) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find variant with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: variant,
  });
};

const getManyVariants = async (
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
  const matchingResults = await Variant.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Variant.find(filter);

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
  const variants = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      currentPage: page,
      results: variants.length,
      totalPages,
      itemsPerPage,
      totalResults: matchingResults,
    },
    data: variants,
  });
};

const updateVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { variantName, options } = req.body;

  if (options) {
    options = options.map((item: any) => ({
      optionName: item.optionName,
      photo: item.photo,
    }));
  }

  const variant = await Variant.findByIdAndUpdate(
    req.params.id,
    { variantName, options },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!variant) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find variant with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: variant,
  });
};

const updateManyVariants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Variant.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find variant with provided ids',
    });
  }

  let { variantName, options } = payload;

  if (options) {
    options = options.map((item: any) => ({
      optionName: item.optionName,
      photo: item.photo,
    }));
  }

  const { modifiedCount } = await Variant.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    { variantName, options },
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

const deleteVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  const variant = await Variant.findByIdAndDelete(id);

  if (!variant) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find variant with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your variant',
  });
};

const deleteManyVariants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Variant.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find variants with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted variants',
    deletedCount,
  });
};

export {
  createVariant,
  getVariant,
  getManyVariants,
  updateVariant,
  updateManyVariants,
  deleteVariant,
  deleteManyVariants,
};
