const { object, number, string, date, boolean } = require('yup');

const { reqQuery, reqParams, objectIdArray } = require('yup-schemas');

const couponSchema = object({
  body: object({
    couponCode: string().max(255).label('Coupon code'),
    status: string().oneOf(['draft', 'active']).label('Coupon status'),
    discountUnit: string().oneOf(['$', '%']).label('discountUnit'),
    discountAmount: number()
      .when('discountUnit', ([discountUnit], schema) =>
        discountUnit === '%'
          ? schema
              .moreThan(1, 'Discount percentage should be greater than 1!')
              .max(100, 'Discount percentage should be less than 100!')
          : schema
              .moreThan(0, 'Discount amount in dollar should be greater than 0')
              .max(9999, 'Discount amount in dollar should be less than 9999'),
      )
      .label('discountAmount'),
    couponQuantity: number().min(1).max(9999).label('couponQuantity'),
    isFreeshipping: boolean(),
    minimumOrder: number().moreThan(0).lessThan(100000),
    maximumOrder: number()
      .lessThan(100000)
      .when('minimumOrder', ([minimumOrder], schema) =>
        minimumOrder > 0
          ? schema
              .moreThan(
                minimumOrder,
                'Maximum order should be greater than minimum order!',
              )
              .required(
                'Maximum order is required when specified minimum order!',
              )
          : schema,
      ),
    startDate: date()
      .min(
        new Date(Date.now() - 15 * 60 * 1000),
        'The discount start date can not be in the past!',
      )
      .label('Coupon start date'),
    endDate: date()
      .when('startDate', ([startDate], schema) =>
        startDate
          ? schema
              .min(
                startDate,
                'The end date of coupon should be after the start date!',
              )
              .required('The end date is required when provided start date!')
          : schema,
      )
      .label('Coupon end date'),
    orderTotal: number().moreThan(0).max(999999),
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
