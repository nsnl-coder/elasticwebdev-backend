const { object, number, string, array } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const menuSchema = object({
  body: object({
    name: string().max(255).label('name'),
    status: string().oneOf(['draft', 'active']).label('status'),
    link: string().max(255).label('link'),
    photo: string().max(255).label('photo'),
    menuType: string().oneOf(['root', 'nested']),
    position: string().oneOf(['header', 'footer', '']),
    ordering: number().min(0).max(9999),
    childMenus: array().of(objectId).label('Child menus'),
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
