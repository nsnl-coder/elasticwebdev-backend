import { object, number, string, array, InferType } from 'yup';

import { reqQuery, reqParams, objectIdArray } from 'yup-schemas';

const optionSchema = object({
  optionName: string().max(255),
  photo: string().max(255),
});

const reqBody = object({
  variantName: string().min(1).max(255).label('Variant name'),
  options: array().of(optionSchema).max(50).label('options'),
  //
  deleteList: objectIdArray,
  updateList: objectIdArray,
  // for testing only
  test_string: string().max(255),
  test_number: number().min(0).max(1000),
  test_any: string().max(255),
});

const variantSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IVariant extends InferType<typeof reqBody> {}

export default variantSchema;
export type { IVariant };
