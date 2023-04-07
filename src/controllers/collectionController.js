const { Collection } = require('../models/collectionModel');

const createCollection = async (req, res, next) => {
  const { name, photo, isPinned } = req.body;
  const collection = await Collection.create({ name, photo, isPinned });
  res.status(201).json({ status: 'success', data: collection });
};

const getCollection = async (req, res, next) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find collection with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: collection,
  });
};

const getManyCollections = async (req, res, next) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 10,
    filter,
  } = req.query;

  // 0. check how many result
  const matchingResults = await Collection.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Collection.find(filter);

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
  const collections = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      currentPage: page,
      totalPages,
      itemsPerPage,
      results: collections.length,
      totalResults: matchingResults,
    },
    data: collections,
  });
};

const updateCollection = async (req, res, next) => {
  const { name, photo, isPinned, status } = req.body;

  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { name, photo, isPinned, status },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!collection) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find collection with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: collection,
  });
};

const updateManyCollections = async (req, res, next) => {
  const { updateList, ...payload } = req.body;
  const { name, photo, isPinned, status } = payload;

  // check if ids in updateList all exist
  const matchedDocuments = await Collection.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find collection with provided ids',
    });
  }

  const { modifiedCount } = await Collection.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    { name, photo, isPinned, status },
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

const deleteCollection = async (req, res, next) => {
  const id = req.params.id;

  const collection = await Collection.findByIdAndDelete(id);

  if (!collection) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find collection with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your collection',
  });
};

const deleteManyCollections = async (req, res, next) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Collection.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find collections with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted collections',
    deletedCount,
  });
};

module.exports = {
  createCollection,
  getCollection,
  getManyCollections,
  updateCollection,
  updateManyCollections,
  deleteCollection,
  deleteManyCollections,
};
