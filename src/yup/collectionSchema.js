const { object, number, string, boolean } = require('yup');
const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const collectionSchema = object({
  body: object({
    name: string().max(255),
    photo: string().max(255),
    isPinned: boolean(),
    status: string().oneOf(['draft', 'active']),
    deleteList: objectIdArray,
    updateList: objectIdArray,
    // for testing only
    test_string: string().max(240),
    test_number: number().min(0).max(9999),
    test_any: string().max(240),
  }),
  params: reqParams,
  query: reqQuery,
});

module.exports = collectionSchema;
