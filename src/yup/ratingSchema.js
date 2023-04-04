const { object, number, string } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const ratingSchema = object({
  body: object({
    product: objectId,
    stars: number().oneOf([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]),
    content: string().max(255),
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

module.exports = ratingSchema;
