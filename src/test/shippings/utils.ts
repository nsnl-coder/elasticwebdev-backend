import { Shipping } from "../../models/shippingModel";;

const validShippingData = {
  display_name: 'Express shipping',
  fees: 25,
  delivery_min: 1,
  delivery_min_unit: 'day',
  delivery_max: 2,
  delivery_max_unit: 'week',
};

const createShipping = async (data) => {
  const shipping = await Shipping.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(shipping));
};

export { createShipping, validShippingData };
