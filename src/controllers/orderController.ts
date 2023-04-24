import { NextFunction, Request, Response } from 'express';
import { createPaymentIntent } from '../config/stripe';
import { Order } from '../models/orderModel';
import { Product } from '../models/productModel';
import { Shipping } from '../models/shippingModel';
import { getCouponStatus } from './couponController';
import { IOrder, IOrderItem } from '../yup/orderSchema';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  let order: IOrder = req.body;

  let { items, ...payload } = order;

  const populatedItems: IOrderItem[] = (await Product.populate(items, {
    path: 'product',
    select: 'name price slug variants',
  })) as any;

  const updatedItems: IOrderItem[] = getItemsPrice(populatedItems);

  const { notes, phone, email, fullname, shippingAddress, couponCode } =
    payload;

  const orderInfo = await getOrderInfo(updatedItems, payload);

  const orderDetail = {
    orderNumber: randomOrderNumber(100000, 999999),
    subTotal: orderInfo.subTotal,
    grandTotal: orderInfo.grandTotal,
    items,
    shippingInfo: {
      fullname,
      email,
      phone,
      address: {
        line1: shippingAddress,
      },
      notes,
    },
    shippingMethod: orderInfo.shipping,
    discount: {
      inDollar: orderInfo.discountInDollar,
      inPercent: orderInfo.discountInPercent,
      couponCode,
    },
  };

  order = await Order.create(orderDetail);

  await createPaymentIntent(res, order);
};

const getOrderInfo = async (
  items: IOrderItem[],
  payload: Omit<IOrder, 'items'>,
) => {
  const { couponCode, shippingMethod } = payload;

  const subTotal = items.reduce((total, item) => {
    const quantity = item.quantity || 1;
    const itemTotal = item.product.price! * quantity;
    return total + itemTotal;
  }, 0);

  const { discountInPercent, discountInDollar } = await getCouponStatus(
    couponCode,
    subTotal,
  );

  const shipping = await Shipping.findById(shippingMethod).select(
    '_id dislay_name delivery_min delivery_max delivery_min_unit delivery_max_unit fees',
  );

  if (!shipping) {
    throw Error('Can not find shipping method!');
  }

  if (shipping.freeshipOrderOver && subTotal > shipping.freeshipOrderOver) {
    shipping.fees = 0;
  }

  const grandTotal = subTotal - discountInDollar + shipping.fees!;

  return {
    subTotal,
    grandTotal,
    shipping,
    discountInPercent,
    discountInDollar,
    couponCode,
  };
};

const randomOrderNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// get price for item based on their selected variants & options
const getItemsPrice = (items: IOrderItem[]): IOrderItem[] => {
  const updatedItems: IOrderItem[] = [];

  items.forEach((item, i) => {
    // product has no variants
    if (!item.product.variants || !item.product.variants?.length) {
      updatedItems.push(item);
      return;
    }

    // product has variants
    // did not select options
    if (!item.selectedOptions || !item.selectedOptions.length) {
      throw new Error('You must select all the variants!');
    }

    if (item.selectedOptions.length !== item.product.variants.length) {
      throw new Error('You must select all the variants!');
    }

    // get selected option
    const allOptions = getAllOptions(items[i].product);
    const selectedOptions = item.selectedOptions.map((option) => {
      if (allOptions[option]) {
        return allOptions[option];
      }
      throw Error('Can not find selected option!');
    });

    //
    const { highestPrice, optionImage } =
      getOptionImageAndPrice(selectedOptions);

    if (highestPrice > item.product.price!) {
      item.product.price = highestPrice;
    }

    if (optionImage) {
      if (!item.product.previewImages) item.product.previewImages = [];
      item.product.previewImages[0] = optionImage;
    }
  });

  return updatedItems;
};

const getOptionImageAndPrice = (
  options: TransformedOption[],
): { highestPrice: number; optionImage: null | string } => {
  let highestPrice = 0;
  let optionImage = null;

  options.forEach((option) => {
    if (option.price && option.price > highestPrice) {
      highestPrice = option.price;
      optionImage = option.photo;
    }
  });

  return { highestPrice, optionImage };
};

interface TransformedOption {
  variantName?: string;
  _id?: string;
  price?: number;
  optionName?: string;
  photo?: string;
}

interface OptionsObj {
  [_id: string]: TransformedOption;
}

const getAllOptions = (product: IOrderItem['product']): OptionsObj => {
  const optionsObj: OptionsObj = {};

  product.variants?.forEach((variant) => {
    variant.options?.forEach((option) => {
      if (option._id && typeof option === 'object') {
        optionsObj[option._id] = {
          ...new Object(option),
          variantName: variant.variantName,
        };
      }
    });
  });

  return optionsObj;
};

// ===========================

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      status: 'success',
      message: 'Can not find order with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
};

const getManyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    fields,
    sort = '-createdAt', // new to old
    page = 1,
    itemsPerPage = 10,
    filter,
  } = req.query;

  // 0. check how many result
  const matchingResults = await Order.countDocuments(filter);
  const totalPages = Math.ceil(matchingResults / itemsPerPage);

  if (page > totalPages) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
    });
  }

  // 1. create inital query but not await it
  let query = Order.find(filter);

  // 2. sorting
  query = query.sort(sort);

  // 3. limit fields
  if (fields) {
    query = query.select(fields);
  }

  // 4. pagination
  const skip = (page - 1) * itemsPerPage;
  const limit = itemsPerPage;

  query = query.skip(skip).limit(limit);

  // 5. finally await query
  const orders = await query;

  res.status(200).json({
    status: 'success',
    pagination: {
      currentPage: page,
      results: orders.length,
      totalPages,
      itemsPerPage,
      totalResults: matchingResults,
    },
    data: orders,
  });
};

const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;

  const order = await Order.findByIdAndUpdate({ _id: req.params.id }, body, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find order with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
};

const updateManyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: need to destruct payload
  const { updateList, ...payload } = req.body;

  // check if ids in updateList all exist
  const matchedDocuments = await Order.countDocuments({
    _id: {
      $in: updateList,
    },
  });

  if (matchedDocuments < updateList.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find order with provided ids',
    });
  }

  const { modifiedCount } = await Order.updateMany(
    {
      _id: {
        $in: updateList,
      },
    },
    payload,
    {
      runValidators: true,
    },
  );

  if (modifiedCount !== updateList.length) {
    return res.status(400).json({
      status: 'unknown',
      message: 'your orders may be updated or not!',
    });
  }

  res.status(200).json({
    status: 'success',
    modifiedCount,
  });
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return res.status(404).json({
      status: 'fail',
      message: 'Cant not find order with provided id',
    });
  }

  res.status(200).json({
    status: 'success',
    messaage: 'you successfully delete your order',
  });
};

const deleteManyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;

  const { deletedCount } = await Order.deleteMany({
    _id: {
      $in: deleteList,
    },
  });

  if (deletedCount === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Can not find orders with provided ids',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted orders',
    deletedCount,
  });
};

export {
  createOrder,
  getOrder,
  getManyOrders,
  updateOrder,
  updateManyOrders,
  deleteOrder,
  deleteManyOrders,
};