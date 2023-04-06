const { Contact } = require('../models/contactModel');

const createContact = async (req, res, next) => {
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

const getContact = async (req, res, next) => {
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

const getManyContacts = async (req, res, next) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 20,
    filter,
  } = req.query;

  // 0. check how many result
  const matchingResults = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
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
    data: contacts,
    pagination: {
      currentPage: page,
      results: contacts.length,
      totalPages,
      totalResults: matchingResults,
    },
  });
};

const updateContact = async (req, res, next) => {
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

const updateManyContacts = async (req, res, next) => {
  // TODO: need to destruct payload
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
    payload;

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

  if (modifiedCount !== updateList.length) {
    return res.status(400).json({
      status: 'unknown',
      message: 'your contacts may be updated or not!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteContact = async (req, res, next) => {
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
    messaage: 'you successfully delete your contact',
  });
};

const deleteManyContacts = async (req, res, next) => {
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
    deletedCount,
  });
};

module.exports = {
  createContact,
  getContact,
  getManyContacts,
  updateContact,
  updateManyContacts,
  deleteContact,
  deleteManyContacts,
};
