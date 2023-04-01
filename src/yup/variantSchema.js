const { object, number, string, array } = require('yup');

const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const optionSchema = object({
  optionName: string().max(255).required(),
  photo: string().max(255),
});

const variantSchema = object({
  body: object({
    name: string().min(1).max(255),
    options: array().of(optionSchema),
    //
    deleteList: objectIdArray,
    updateList: objectIdArray,
    // for testing only
    test_string: string().max(255),
    test_number: number().min(0).max(1000),
    test_any: string().max(255),
  }),
  params: reqParams,
  query: reqQuery,
});

module.exports = variantSchema;
