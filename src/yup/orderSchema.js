const { object, number, string, array } = require('yup');

const { reqQuery, reqParams, objectIdArray, objectId } = require('yup-schemas');

const itemSchema = object({
  product: objectId.required(),
  quantity: number().max(999),
  options: array().of(objectId),
});

const orderSchema = object({
  body: object({
    items: array()
      .of(itemSchema)
      .min(1, 'Your order need to have at least one item!')
      .label('Order items'),
    couponCode: string().max(255).label('Discount code'),
    notes: string().max(255).label('Order note'),
    email: string().email().max(150).lowercase().label('email'),
    fullname: string().max(255).label('Full name'),
    phone: string()
      .matches(/^[0-9]{9,16}$/, 'Please provide valid phone number')
      .label('Phone number'),
    shippingAddress: string().max(255).label('Shipping address'),
    shippingMethod: objectId,
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
