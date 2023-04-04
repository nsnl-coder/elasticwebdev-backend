const { Rating } = require('../models/ratingModel');

const createRating = async (req, res, next) => {
  const { product, stars, content } = req.body;

  const rating = await Rating.create({
    createdBy: req.user._id,
    product,
    stars,
    content,
  });

  res.status(201).json({ status: 'success', data: rating });
};

const getRating = async (req, res, next) => {
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

const getManyRatings = async (req, res, next) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 20,
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
    totalPages,
    results: ratings.length,
    data: ratings,
  });
};

const updateRating = async (req, res, next) => {
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

const updateManyRatings = async (req, res, next) => {
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

const deleteRating = async (req, res, next) => {
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

const deleteManyRatings = async (req, res, next) => {
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

module.exports = {
  createRating,
  getRating,
  getManyRatings,
  updateRating,
  updateManyRatings,
  deleteRating,
  deleteManyRatings,
};