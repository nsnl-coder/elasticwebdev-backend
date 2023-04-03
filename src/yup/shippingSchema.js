const { object, number, string } = require('yup');

const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const shippingSchema = object({
  body: object({
    name: string().max(255),
    fees: number().min(0).max(999),
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

module.exports = shippingSchema;
