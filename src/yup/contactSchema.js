const { object, number, string, boolean } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const contactSchema = object({
  body: object({
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
  }),
  params: reqParams,
  query: reqQuery,
});

module.exports = contactSchema;
