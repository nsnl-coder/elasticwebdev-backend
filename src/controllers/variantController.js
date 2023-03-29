const { Variant } = require('../models/variantModel');

const createVariant = async (req, res, next) => {
  const body = req.body;
  const variant = await Variant.create(body);
  res.status(201).json({ status: 'success', data: variant });
};

const getVariant = async (req, res, next) => {
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

const getAllVariants = async (req, res, next) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 20,
    filter,
  } = req.query;

  // create inital query but not await it
  let query = Variant.find(filter);

  // sorting
  query = query.sort(sort);
  // limit fields
  if (fields) {
    query = query.select(fields);
  }

  // pagination
  const skip = (page - 1) * itemsPerPage;
  const limit = itemsPerPage;

  query = query.skip(skip).limit(limit);

  const variants = await Variant.find();
  res
    .status(200)
    .json({ status: 'success', results: variants.length, data: variants });
};

const updateVariant = async (req, res, next) => {
  const body = req.body;

  const variant = await Variant.findByIdAndUpdate(req.params.id, body, {
    new: true,
  });

  if (!variant) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find variant with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: variant,
  });
};

const updateManyVariants = async (req, res, next) => {
  const { updateList, payload } = req.body;

  const { modifiedCount } = await Variant.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    payload,
  );

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteVariant = async (req, res, next) => {
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

const deleteManyVariants = async (req, res, next) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Variant.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find variants with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted variants',
    deletedCount,
  });
};

module.exports = {
  createVariant,
  getVariant,
  getAllVariants,
  updateVariant,
  updateManyVariants,
  deleteVariant,
  deleteManyVariants,
};
