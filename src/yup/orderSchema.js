const { object, number, string, array } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const itemSchema = object({
  product: objectId.required(),
  quantity: number().max(999),
  options: array().of(objectId),
});

const orderSchema = object({
  body: object({
    items: array().of(itemSchema).min(1),
    discountCode: string().max(255),
    orderNotes: string().max(255),

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

module.exports = orderSchema;
