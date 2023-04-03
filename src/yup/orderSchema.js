const { object, number, string, array } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const itemSchema = object({
  id: objectId.required(),
  quantity: number().max(999).default(1),
  variants: array().of(objectId),
});

const orderSchema = object({
  body: object({
    items: array().of(itemSchema).min(1),
    fullname: string().min(6).max(255).required(),
    email: string().email().max(255),
    phone: string()
      .matches(/^[0-9]{9,16}$/, 'Please provide valid phone number')
      .required(),
    shippingAddress: string().max(255).required(),
    shippingOptions: objectId.required(),
    orderNotes: string().max(255),
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

module.exports = orderSchema;
