import { DateTime } from "luxon";
import { Address, Cart, Order } from "../../../DB/Models/index.js";
import { CouponType, ErrorHandlerClass, OrderStatus, PaymentMethods } from "../../Utils/index.js";
import { calcCartTotal } from "../Cart/Utils/cart.utils.js";
import { applyCoupon, validateCoupon } from "./order.utils.js";


export const addOrder = async (req, res, next) => {
  const { address, addressId, contactNumber, couponCode, shippingFee, VAT, paymentMethod } = req.body;
  const userId = req.user._id;

  // search user's cart with products

  const cart = await Cart.findOne({ userId }).populate("products.productId");

  if (!cart || !cart.products.length) {
    return next(new ErrorHandlerClass("Empty cart", 400));
  }

  const isSoldOut = cart.products.find((p) => p.productId.stock < p.quantity);

  // check the stock of the products

  if (isSoldOut) {
    return next(new ErrorHandlerClass(`Product ${isSoldOut.productId.title} was sold out`, 400));
  }

  const subTotal = calcCartTotal(cart.products);

  let total = subTotal + shippingFee + VAT;

  let coupon = null

  if (couponCode) {
    const isCouponValid = await validateCoupon(couponCode, userId);

    if (isCouponValid.error) {
      return next(new ErrorHandlerClass(isCouponValid.message, 400))
    }
    coupon = isCouponValid.coupon;
    total = applyCoupon(subTotal, coupon)

  }

  if (!address && !addressId) {
    return next(new ErrorHandlerClass("Address is required", 400));
  }

  if (addressId) {
    // check addressId validation

    const addressInfo = await Address.findOne({ _id: addressId, userId });

    if (!addressInfo) {
      return next(new ErrorHandlerClass("Invalid address", 400))
    }

  }

  let orderStatus = OrderStatus.Pending;

  if (paymentMethod === PaymentMethods.Cash) {
    orderStatus = OrderStatus.Placed;
  }

  const orderInfo = new Order({
    userId,
    products: cart.products,
    address,
    addressId,
    contactNumber,
    total,
    subTotal,
    paymentMethod,
    orderStatus,
    shippingFee,
    VAT,
    couponId: coupon?._id,
    orderStatus,
    estimatedDeliveryDate: DateTime.now().plus({ days: 7 }).toFormat("yyyy MM dd")
  })

  await orderInfo.save();

  // clearing the cart

  cart.products = [];
  await cart.save();

  // decrement the stock of products



  // increment the usageCount of coupon

  res.status(201).json({ message: "Order has been added", data: orderInfo });
}

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    return next(new ErrorHandlerClass("Invalid order", 400));
  }

  if (order.orderStatus === OrderStatus.Cancelled) {
    return next(new ErrorHandlerClass("Order already cancelled", 400));
  }

  if (order.orderStatus === OrderStatus.Delivered) {
    return next(new ErrorHandlerClass("Can't cancel delivered order", 400));
  }

  order.orderStatus = OrderStatus.Cancelled;
  order.cancelledBy = userId;
  order.cancelledAt = Date.now();

  await order.save();

  res.status(200).json({ message: "Order has been cancelled", data: order });
}

export const orderDelivered = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandlerClass("Invalid order", 400));
  }

  if (order.orderStatus === OrderStatus.Delivered) {
    return next(new ErrorHandlerClass("Order already delivered", 400));
  }

  order.orderStatus = OrderStatus.Delivered;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({ message: "Order has been delivered", data: order });
}

export const getUserOrders = async (req, res, next) => {
  const userId = req.user._id;

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  if (orders.length === 0) {
    return res.status(200).json({ message: "Orders does not exist", data: [] });
  }

  const total = orders.length;

  res.status(200).json({ message: "done", total, data: orders });
}

export const getOrderDetails = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandlerClass("Invalid order", 400));
  }

  if (order.userId.toString() !== userId.toString()) {
    return next(new ErrorHandlerClass("You are not allowed to access this order", 403));
  }

  res.status(200).json({ message: "done", data: order });
}
