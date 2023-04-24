import { object, number, string, boolean, array, InferType } from 'yup';

import { reqQuery, reqParams, objectIdArray, objectId } from 'yup-schemas';

const variantSchema = object({
  variantName: string().max(255),
  _id: string().transform((value) => undefined),
  options: array().of(
    object({
      optionName: string().max(255),
      photo: string().max(255),
      price: number().max(99999),
      _id: string().transform((value) => undefined),
    }),
  ),
});

const reqBody = object({
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
});

const productSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IProduct extends InferType<typeof reqBody> {
  slug: string;
  numberOfRatings: number;
  ratingsAverage: number;
}

export default productSchema;
export type { IProduct };
