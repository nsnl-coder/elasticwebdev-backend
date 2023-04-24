import { object, number, string, boolean, InferType } from 'yup';
import { reqQuery, reqParams, objectIdArray } from 'yup-schemas';

const reqBody = object({
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
});

const collectionSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface ICollection extends InferType<typeof reqBody> {
  slug: string;
}

export default collectionSchema;
export type { ICollection };
