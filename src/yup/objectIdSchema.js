const ObjectId = require('mongoose').Types.ObjectId;
const yup = require('yup');

const objectIdSchema = yup
  .string()
  .test(
    'is-object-id',
    'Invalid ObjectId',
    (value) => ObjectId.isValid(value) && String(new ObjectId(value)) === value,
  );

module.exports = objectIdSchema;
