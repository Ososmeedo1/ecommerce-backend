import { DateTime } from "luxon";
import { Coupon, CouponChangeLog, User } from "../../../DB/Models/index.js";
import { ApiFeatures, ErrorHandlerClass } from "../../Utils/index.js";

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

  const fromParsedDate = DateTime.fromFormat(from, 'yyyy-MM-dd', { zone: process.env.TIMEZONE }).toUTC().toJSDate();
  const tillParsedDate = DateTime.fromFormat(till, 'yyyy-MM-dd', { zone: process.env.TIMEZONE }).toUTC().toJSDate();

  console.log(fromParsedDate);
  console.log(tillParsedDate);


  const newCoupon = new Coupon({ couponCode, from: fromParsedDate, till: tillParsedDate, couponAmount, couponType, Users, addedBy: req.user._id });

  await newCoupon.save();

  return res.status(201).json({ message: "done", data: newCoupon })


}

export const getCoupons = async (req, res, next) => {
  const ApiFeaturesInstance = new ApiFeatures(Coupon.find(), req.query).filter().search().pagination().fields().sort();
  const coupons = await ApiFeaturesInstance.mongooseQuery;

  if (coupons.length === 0) {
    return res.status(200).json({ message: "Coupons does not exist", data: [] });
  }

  const page = ApiFeaturesInstance.pageNumber;
  const total = await ApiFeaturesInstance.getCount();
  res.status(200).json({ message: "done", page, total, data: coupons });
}

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId).populate([{ path: 'addedBy' }, { path: 'Users.userId' }]);

  if (!coupon) {
    return next(new ErrorHandlerClass("Coupon not exists", 404));
  }

  res.status(200).json({ message: "done", data: coupon });
}

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.user._id;
  const { couponCode, from, till, couponAmount, couponType, Users, isEnabled } = req.body;


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
    const fromParsedDate = DateTime.fromFormat(from, 'yyyy-MM-dd', { zone: process.env.TIMEZONE }).toUTC().toJSDate();
    coupon.from = fromParsedDate;
    logUpdatedObject.changes.from = fromParsedDate;
  }

  if (till) {
    const tillParsedDate = DateTime.fromFormat(till, 'yyyy-MM-dd', { zone: process.env.TIMEZONE }).toUTC().toJSDate();
    coupon.till = tillParsedDate;
    logUpdatedObject.changes.till = tillParsedDate;
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

  if (isEnabled) {
    coupon.isEnabled = isEnabled;
    logUpdatedObject.changes.isEnabled = isEnabled;

    const logUpdatedObject = { couponId, updatedBy: userId, changes: { isEnabled } };

    const log = await new CouponChangeLog(logUpdatedObject).save();
  }

  await coupon.save();

  res.status(200).json({ message: "Coupon updated", data: { coupon, log } });

}