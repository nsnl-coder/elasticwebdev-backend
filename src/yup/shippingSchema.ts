import { object, number, string, InferType } from 'yup';

import { reqQuery, reqParams, objectIdArray } from 'yup-schemas';

const invalid_time = 'Delivery max unit should have higher time unit.';

const reqBody = object({
  display_name: string().max(255).label('name'),
  fees: number().min(0).max(9999).label('Delivery fees'),
  status: string().oneOf(['draft', 'active']),
  delivery_min: number().min(0).max(9999).label('Delivery min duration'),
  delivery_min_unit: string()
    .oneOf(['hour', 'day', 'business_day', 'week', 'month'])
    .label('Delivery min duration unit'),
  delivery_max_unit: string()
    .when(
      ['delivery_min', 'delivery_min_unit'],
      ([delivery_min, delivery_min_unit]: any[], schema: any) => {
        if (!delivery_min) return schema;

        if (delivery_min_unit === 'hour') {
          return schema
            .oneOf(
              ['hour', 'day', 'business_day', 'week', 'month'],
              invalid_time,
            )
            .required();
        }

        if (delivery_min_unit === 'day') {
          return schema
            .oneOf(['day', 'business_day', 'week', 'month'], invalid_time)
            .required();
        }

        if (delivery_min_unit === 'business_day') {
          return schema
            .oneOf(['business_day', 'week', 'month'], invalid_time)
            .required();
        }

        if (delivery_min_unit === 'week') {
          return schema.oneOf(['week', 'month'], invalid_time).required();
        }

        if (delivery_min_unit === 'month') {
          return schema.oneOf(['month'], invalid_time).required();
        }
      },
    )
    .label('Delivery max duration unit'),
  delivery_max: number()
    .min(0)
    .max(999)
    .when(
      ['delivery_min_unit', 'delivery_max_unit', 'delivery_min'],
      ([delivery_min_unit, delivery_max_unit, delivery_min], schema) => {
        if (!delivery_min) return schema;

        if (delivery_max_unit === delivery_min_unit) {
          return schema
            .min(
              delivery_min,
              'Delivery max time should be longer than delivery min time.',
            )
            .required();
        }

        return schema.required();
      },
    )
    .label('delivery max duration'),
  freeshipOrderOver: number()
    .min(0)
    .max(9999999)
    .label('Freeship for order over'),
  deleteList: objectIdArray,
  updateList: objectIdArray,
  // for testing only
  test_string: string().max(255),
  test_number: number().min(0).max(1000),
  test_any: string().max(255),
});

const shippingSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IShipping extends InferType<typeof reqBody> {}

export default shippingSchema;
export type { IShipping };
