const { object, number, string, boolean, array } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const variantSchema = object({
  variantName: string().max(255),
  options: array().of(
    object({
      optionName: string().max(255),
      photo: string().max(255),
      price: number().max(99999),
    }),
  ),
});

const productSchema = object({
  body: object({
    name: string().max(255).label('Product name'),
    status: string().oneOf(['draft', 'active']).label('Product status'),
    overview: string().max(10000).label('overview'),
    description: string().max(20000).label('description'),
    isPinned: boolean().label('isPinned'),
    price: number().min(0).max(99999).label('price'),
    discountPrice: number()
      .when('price', ([price], schema) =>
        schema.max(price, 'Discount price must be smaller than current price'),
      )
      .label('discountPrice'),
    images: array().max(20).of(string().max(255)).label('Product images'),
    previewImages: array().max(2).of(string().max(255)).label('Preview images'),
    collections: array().of(objectId).max(100).label('collections ids'),
    variants: array().of(variantSchema).max(100).label('Product variants'),
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

module.exports = productSchema;
