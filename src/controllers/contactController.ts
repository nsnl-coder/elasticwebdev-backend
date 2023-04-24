import { NextFunction, Request, Response } from 'express';
import { Contact } from '../models/contactModel';
import { IContact } from '../yup/contactSchema';

const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, fullname, phone, subject, content } = req.body;
  const contact = await Contact.create({
    email,
    fullname,
    phone,
    subject,
    content,
  });
  res.status(201).json({ status: 'success', data: contact });
};

const getContact = async (req: Request, res: Response, next: NextFunction) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find contact with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: contact,
  });
};

const getManyContacts = async (
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
  const matchingResults = await Contact.countDocuments(filter);
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
  let query = Contact.find(filter);

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
  const contacts = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      ...pagination,
      results: contacts.length,
    },
    data: contacts,
  });
};

const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, fullname, phone, subject, content, isRead, adminNotes } =
    req.body;

  const contact = await Contact.findByIdAndUpdate(
    { _id: req.params.id },
    { email, fullname, phone, subject, content, isRead, adminNotes },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!contact) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find contact with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: contact,
  });
};

const updateManyContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Contact.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find contact with provided ids',
    });
  }

  const { email, fullname, phone, subject, content, isRead, adminNotes } =
    payload as IContact;

  const { modifiedCount } = await Contact.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    { email, fullname, phone, subject, content, isRead, adminNotes },
    {
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount,
    },
  });
};

const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find contact with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'you successfully delete your contact',
  });
};

const deleteManyContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Contact.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find contacts with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted contacts',
    data: {
      deletedCount,
    },
  });
};

export {
  createContact,
  getContact,
  getManyContacts,
  updateContact,
  updateManyContacts,
  deleteContact,
  deleteManyContacts,
};
