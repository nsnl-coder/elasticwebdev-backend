import { Shipping } from '../../models/shippingModel';
import { IShipping } from '../../yup/shippingSchema';
const validShippingData: IShipping = {
  display_name: 'Express shipping',
  status: 'active',
  fees: 25,
  freeshipOrderOver: 999,
  delivery_min: 1,
  delivery_min_unit: 'day',
  delivery_max: 2,
  delivery_max_unit: 'week',
};

const createShipping = async (
  data?: Partial<IShipping>,
): Promise<IShipping> => {
  const shipping = await Shipping.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(shipping));
};

export { createShipping, validShippingData };
