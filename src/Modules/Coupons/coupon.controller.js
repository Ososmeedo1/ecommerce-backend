import { Coupon, CouponChangeLog, User } from "../../../DB/Models/index.js";
import { ErrorHandlerClass } from "../../Utils/index.js";

/**
 * @api {post} /coupons/add Add coupon
 */


export const addCoupon = async (req, res, next) => {
  const { couponCode, from, till, couponAmount, couponType, Users } = req.body;

  // checking coupon code

  const checkCoupon = await Coupon.findOne({ couponCode });


  if (checkCoupon) {
    return next(new ErrorHandlerClass("Coupon already exists", 400))
  }

  const userIds = Users.map(u => u.userId);

  const validUsers = await User.find({ _id: { $in: userIds } });

  if (validUsers.length !== userIds.length) {
    return next(new ErrorHandlerClass("Invalid users", 400))
  }

  const newCoupon = new Coupon({ couponCode, from, till, couponAmount, couponType, Users, addedBy: req.user._id });

  await newCoupon.save();

  return res.status(201).json({ message: "done", data: newCoupon })


}

export const getCoupons = async (req, res, next) => {
  const { isEnabled } = req.query;
  const filters = {};
  if (isEnabled) {
    filters.isEnabled = isEnabled === "true" ? true : false;
  }
  const coupons = await Coupon.find(filters);

  res.status(200).json({ message: "done", data: coupons });
}

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next(new ErrorHandlerClass("Coupon not exists", 404));
  }

  res.status(200).json({ message: "done", data: coupon });
}

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.user._id;
  const { couponCode, from, till, couponAmount, couponType, Users } = req.body;


  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next(new ErrorHandlerClass("Coupon not exists", 404));
  }

  const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };

  if (couponCode) {
    const isCouponCodeExist = await Coupon.findOne({ couponCode });
    if (isCouponCodeExist) {
      return next(new ErrorHandlerClass("Coupon already exists"));
    }

    coupon.couponCode = couponCode;
    logUpdatedObject.changes.couponCode = couponCode;
  }

  if (from) {
    coupon.from = from;
    logUpdatedObject.changes.from = from;
  }

  if (till) {
    coupon.till = till;
    logUpdatedObject.changes.till = till;
  }

  if (couponAmount) {
    coupon.couponAmount = couponAmount;
    logUpdatedObject.changes.couponAmount = couponAmount;
  }

  if (couponType) {
    coupon.couponType = couponType;
    logUpdatedObject.changes.couponType = couponType;
  }

  if (Users) {
    const userIds = Users.map(u => u.userId);

    const validUsers = await User.find({ _id: { $in: userIds } });

    if (validUsers.length !== userIds.length) {
      return next(new ErrorHandlerClass("Invalid users", 400))
    }

    coupon.Users = Users;
    logUpdatedObject.changes.Users = Users;
  }

  await coupon.save();
  const log = await new CouponChangeLog(logUpdatedObject).save();

  res.status(200).json({ message: "Coupon updated", data: { coupon, log } });

}

export const disableEnableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.user._id;
  const { enable } = req.body;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next(new ErrorHandlerClass("Coupon not exists", 404));
  }

  const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };

  if (enable === true) {
    coupon.isEnabled = true;
    logUpdatedObject.changes.isEnabled = true;
  }

  if (enable === false) {
    coupon.isEnabled = false;
    logUpdatedObject.changes.isEnabled = false;
  }

  await coupon.save();

  const log = await new CouponChangeLog(logUpdatedObject).save();

  res.status(200).json({ message: "done", data: { coupon, log } })
}