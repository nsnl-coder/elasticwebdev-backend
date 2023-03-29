const { object, number, array, string } = require('yup');

const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const optionSchema = object({
  text: string().required(),
  price: number().min(0).max(999999),
  costPerItem: number().min(0).max(999999),
});

const variantSchema = object({
  //req.body
  body: object({
    price: number().min(0).max(999999),
    options: array().of(optionSchema),
    //
    deleteList: objectIdArray,
    updateList: objectIdArray,
  }),
  //req.params
  params: reqParams,
  // req.query
  query: reqQuery,
});

module.exports = variantSchema;
