import { NextFunction, Request, Response } from 'express';
import { Menu } from '../models/menuModel';

const createMenu = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const menu = await Menu.create(body);
  res.status(201).json({ status: 'success', data: menu });
};

const getMenu = async (req: Request, res: Response, next: NextFunction) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find menu with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: menu,
  });
};

const getManyMenus = async (
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
  const matchingResults = await Menu.countDocuments(filter);
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
  let query = Menu.find(filter);

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
  const menus = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      ...pagination,
      results: menus.length,
    },
    data: menus,
  });
};

const updateMenu = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;

  const menu = await Menu.findByIdAndUpdate({ _id: req.params.id }, body, {
    new: true,
    runValidators: true,
  });

  if (!menu) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find menu with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: menu,
  });
};

const updateManyMenus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Menu.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find menu with provided ids',
    });
  }

  const { modifiedCount } = await Menu.updateMany(
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

  res.status(200).json({
    status: 'success',
    message: 'You successfully modified!',
    data: {
      modifiedCount,
    },
  });
};

const deleteMenu = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const menu = await Menu.findByIdAndDelete(id);

  if (!menu) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find menu with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'you successfully delete your menu',
  });
};

const deleteManyMenus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Menu.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find menus with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted menus',
    data: {
      deletedCount,
    },
  });
};

export {
  createMenu,
  getMenu,
  getManyMenus,
  updateMenu,
  updateManyMenus,
  deleteMenu,
  deleteManyMenus,
};
