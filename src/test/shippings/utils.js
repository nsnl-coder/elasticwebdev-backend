const { Shipping } = require('../../models/shippingModel');

const validShippingData = {
  name: 'Express shipping',
  fees: 25,
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

module.exports = { createShipping, validShippingData };
