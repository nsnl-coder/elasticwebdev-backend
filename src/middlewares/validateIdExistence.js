/**
 * express middleware to make sure an object id exists in database
 * this middleware accept mongoose model & field name that contain objectid
 */

const validateIdExistence = (Model, fieldname) => {
  return async (req, res, next) => {
    const ids = req.body[fieldname];

    if (typeof ids === 'string' && !ids) next();
    if (Array.isArray(ids) && ids.length === 0) next();

    if (typeof ids === 'string') {
      const data = await Model.findById(ids);

      if (!data) {
        return res.status(404).json({
          status: 'fail',
          message: `Can not find ${fieldname} with provided id`,
        });
      }
      next();
    }

    if (Array.isArray(ids)) {
      const matchedDocuments = await Model.count({
        _id: { $in: ids },
      });

      if (matchedDocuments !== ids.length) {
        return res.status(404).json({
          status: 'fail',
          message: `Can not find ${fieldname} with provided ids`,
        });
      }

      next();
    }

    res.status(500).json({
      status: 'fail',
      message: 'something went wrong',
    });
  };
};

module.exports = validateIdExistence;
