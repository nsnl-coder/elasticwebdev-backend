const { object, number, string } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const menuSchema = object({
  body: object({
    name: string().max(255).label('name'),
    link: string().max(255).label('link'),
    photo: string().max(255).label('photo'),
    parentMenu: objectId.label('Parent menu id'),
    ordering: number().min(0).max(999).label('ordering'),
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

module.exports = menuSchema;
