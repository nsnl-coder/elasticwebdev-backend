import { Order } from '../../models/orderModel';
import { IOrder, IOrderRequestPayload } from '../../yup/orderSchema';
import { createCoupon, validCouponData } from '../coupons/utils';
import { createProduct, validProductData } from '../products/utils';
import { createShipping, validShippingData } from '../shippings/utils';

const getValidOrderData = async (): Promise<Partial<IOrderRequestPayload>> => {
  const product = await createProduct(validProductData);
  const shipping = await createShipping({
    ...validShippingData,
    display_name: 'Express shipping',
    fees: 25,
  });

  await createCoupon({
    ...validCouponData,
    couponCode: 'TEST_COUPON',
    discountAmount: 20,
    discountUnit: '$',
  });

  return {
    fullname: 'Test Name',
    email: 'test@test.com',
    phone: '123456789',
    shippingAddress: 'test address',
    items: [
      {
        product: product._id!,
        selectedOptions: [
          product.variants![0].options![0]._id,
          product.variants![1].options![0]._id,
        ],
        quantity: 3,
      },
      {
        product: product._id!,
        selectedOptions: [
          product.variants![0].options![1]._id,
          product.variants![1].options![1]._id,
        ],
        quantity: 2,
      },
    ],
    shippingMethod: shipping._id,
    couponCode: 'TEST_COUPON',
    //
    test_string: 'testname2',
    test_number: 14,
    test_any: 'draft',
  };
};

const createOrder = async (data?: Partial<IOrder>): Promise<IOrder> => {
  const order = await Order.create({
    test_string: 'testname',
    test_number: 10,
    test_any: 'draft',
    ...data,
  });

  return JSON.parse(JSON.stringify(order));
};

export { createOrder, getValidOrderData };
