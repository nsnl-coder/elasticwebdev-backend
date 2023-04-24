import { object, number, string, array, InferType } from 'yup';

import { reqQuery, reqParams, objectIdArray, objectId } from 'yup-schemas';

const reqBody = object({
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
});

const menuSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IMenu extends InferType<typeof reqBody> {}

export default menuSchema;
export type { IMenu };
