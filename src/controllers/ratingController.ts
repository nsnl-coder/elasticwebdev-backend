import { NextFunction, Request, Response } from 'express';
import { Rating } from '../models/ratingModel';

const createRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { product, stars, content } = req.body;

  // check if user already rated product
  const doesExist = await Rating.findOne({
    product,
    createdBy: req.user._id,
  });

  if (doesExist) {
    return res.status(400).json({
      status: 'fail',
      message:
        'You already rated this product! You can delete or update your old rating!',
    });
  }

  const rating = await Rating.create({
    createdBy: req.user._id,
    product,
    stars,
    content,
  });

  res.status(201).json({ status: 'success', data: rating });
};

const getRating = async (req: Request, res: Response, next: NextFunction) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find rating with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: rating,
  });
};

const getManyRatings = async (
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
  const matchingResults = await Rating.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Rating.find(filter);

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
  const ratings = await query;

  res.status(200).json({
    status: 'success',
    data: ratings,
    pagination: {
      currentPage: page,
      results: ratings.length,
      totalPages,
      itemsPerPage,
    },
    totalResults: matchingResults,
  });
};

const updateRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { stars, content } = req.body;

  const rating = await Rating.findByIdAndUpdate(
    { _id: req.params.id },
    { stars, content },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!rating) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find rating with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: rating,
  });
};

const updateManyRatings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Rating.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find rating with provided ids',
    });
  }

  const { stars, content } = payload;
  const { modifiedCount } = await Rating.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    { stars, content },
    {
      runValidators: true,
    },
  );

  if (modifiedCount !== updateList.length) {
    return res.status(400).json({
      status: 'unknown',
      message: 'your ratings may be updated or not!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  const rating = await Rating.findByIdAndDelete(id);

  if (!rating) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find rating with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your rating',
  });
};

const deleteManyRatings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Rating.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find ratings with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted ratings',
    deletedCount,
  });
};

export {
  createRating,
  getRating,
  getManyRatings,
  updateRating,
  updateManyRatings,
  deleteRating,
  deleteManyRatings,
};
