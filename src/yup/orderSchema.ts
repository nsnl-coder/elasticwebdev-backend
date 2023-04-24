import { object, number, string, array, InferType } from 'yup';
import { reqQuery, reqParams, objectIdArray, objectId } from 'yup-schemas';
import { IProduct } from './productSchema';
import mongoose, { ObjectId } from 'mongoose';

const itemSchema = object({
  product: objectId.required(),
  quantity: number().max(999),
  selectedOptions: array().of(objectId),
});

const reqBody = object({
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
  shippingAddress: string().min(6).max(255).label('Shipping address'),
  shippingMethod: objectId,
  //
  deleteList: objectIdArray,
  updateList: objectIdArray,
  // for testing only
  test_string: string().max(255),
  test_number: number().min(0).max(1000),
  test_any: string().max(255),
});

const orderSchema = object({
  body: reqBody,
  params: reqParams,
  query: reqQuery,
});

interface IOrderItem {
  product: Pick<
    IProduct,
    'name' | 'price' | 'slug' | 'variants' | 'discountPrice' | 'previewImages'
  >;
  productName: string;
  price: number;
  quantity: number;
  selectedOptions?: string[];
  photos: string[];
  variants?: { variantName?: string; optionName?: string }[];
}

interface IOrder extends Omit<InferType<typeof reqBody>, 'items'> {
  _id?: string;
  createdBy: mongoose.Types.ObjectId;
  orderNumber: number;
  subTotal: number;
  grandTotal: number;
  discount: {
    inDollar: number;
    inPercent: number;
    couponCode: string;
  };

  shipping: {
    name: string;
    fees: number;
  };
  shippingStatus: 'pending' | 'processing' | 'shipped' | 'arrived';
  paymentStatus: 'fail' | 'paid' | 'refuned' | 'processing';
  items: Pick<
    IOrderItem,
    'productName' | 'quantity' | 'price' | 'photos' | 'variants'
  >[];
}

interface IOrderRequestPayload extends InferType<typeof reqBody> {}

export default orderSchema;
export type { IOrder, IOrderItem, IOrderRequestPayload };
