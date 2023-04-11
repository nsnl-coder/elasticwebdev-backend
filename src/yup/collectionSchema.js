const { object, number, string, boolean } = require('yup');
const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const collectionSchema = object({
  body: object({
    name: string().max(255).label('name'),
    description: string().max(2000).label('description'),
    photo: string().max(255).label('photo'),
    isPinned: boolean().label('isPinned'),
    status: string().oneOf(['draft', 'active']).label('status'),
    //
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
