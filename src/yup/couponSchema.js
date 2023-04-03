const { object, number, string, date } = require('yup');

const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const couponSchema = object({
  body: object({
    couponCode: string().max(255),
    status: string().oneOf(['draft', 'active']),
    discountUnit: string().oneOf(['$', '%']),
    discountAmount: number()
      .min(0)
      .when('discountUnit', ([discountUnit], schema) =>
        discountUnit === '%' ? schema.max(100) : schema.max(9999),
      ),
    couponQuantity: number().min(1).max(9999),
    startDate: date().min(new Date(Date.now() - 15 * 60 * 1000)),
    endDate: date().when('startDate', ([startDate], schema) =>
      startDate ? schema.min(startDate).required() : schema,
    ),
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

module.exports = couponSchema;
