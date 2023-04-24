import type { ObjectId } from 'mongoose';
import { object, number, string, InferType } from 'yup';

import { reqQuery, reqParams, objectIdArray, objectId } from 'yup-schemas';

const reqBody = object({
  product: objectId,
  stars: number()
    .oneOf([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5])
    .label('Number of stars'),
  content: string().max(255).label('Rating content'),
  //
  deleteList: objectIdArray,
  updateList: objectIdArray,
  // for testing only
  test_string: string().max(255),
  test_number: number().min(0).max(1000),
  test_any: string().max(255),
});

const ratingSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IRating extends InferType<typeof reqBody> {
  _id?: string;
  createdBy: ObjectId;
}

export default ratingSchema;
export type { IRating };
