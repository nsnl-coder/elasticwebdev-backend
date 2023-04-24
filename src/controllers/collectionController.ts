import { NextFunction, Request, Response } from 'express';
import { Collection } from '../models/collectionModel';

const createCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const collection = await Collection.create(req.body);
  res.status(201).json({ status: 'success', data: collection });
};

const getCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

const getManyCollections = async (
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
  const matchingResults = await Collection.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  let pagination = {
    currentPage: page,
    totalPages,
    itemsPerPage,
    totalResults: matchingResults,
    results: 0,
  };

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      data: [],
      pagination,
    });
  }

  // 1. create inital query but not await it
  let query = Collection.find(filter);

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
  const collections = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      ...pagination,
      results: collections.length,
    },
    data: collections,
  });
};

const updateCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    req.body,
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

const updateManyCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

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
    payload,
  );

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount,
    },
  });
};

const deleteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    message: 'you successfully delete your collection',
  });
};

const deleteManyCollections = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    data: {
      deletedCount,
    },
  });
};

export {
  createCollection,
  getCollection,
  getManyCollections,
  updateCollection,
  updateManyCollections,
  deleteCollection,
  deleteManyCollections,
};
