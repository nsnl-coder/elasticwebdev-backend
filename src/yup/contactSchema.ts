import { object, number, string, boolean, InferType } from 'yup';

import { reqQuery, reqParams, objectIdArray, objectId } from 'yup-schemas';

const reqBody = object({
  email: string().email().label('email'),
  fullname: string().max(255).label('fullname'),
  phone: string()
    .matches(/^[0-9]{9,16}$/, 'Please provide valid phone number')
    .label('phone'),
  subject: string().max(100).label('subject'),
  content: string().max(255).label('content'),
  isRead: boolean().label('isRead'),
  adminNotes: string().max(255).label('Note'),
  //
  deleteList: objectIdArray,
  updateList: objectIdArray,
  // for testing only
  test_string: string().max(255),
  test_number: number().min(0).max(1000),
  test_any: string().max(255),
});

const contactSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IContact extends InferType<typeof reqBody> {}

export default contactSchema;
export type { IContact };
