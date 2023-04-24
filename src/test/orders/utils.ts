import { Order } from "../../models/orderModel";;

const validOrderData = {
  test_string: 'testname2',
  test_number: 14,
  test_any: 'draft',
};

const createOrder = async (data) => {
  const order = await Order.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(order));
};

export { createOrder, validOrderData };
