import { DateTime } from "luxon";
import { Coupon } from "../../../DB/Models/index.js"
import { CouponType } from "../../Utils/index.js";
/**
 * 
 * @param {*} couponCode 
 * @param {*} userId 
 * @returns {message: String, error: Boolean, coupon: Object}
 */


export const validateCoupon = async (couponCode, userId) => {
  // get coupon by coupon code
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) {
    return { message: "Invalid coupon code", error: true };
  }

  // check if coupon is enabled

  if (!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
    return { message: "Coupon is not enabled", error: true };
  }

  if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
    return { message: `Coupon has not started yet, will start in ${coupon.from}` }
  }

  // check if user not eligible to use coupon

  const isUserNotEligible = coupon.Users.some(u => u.userId.toString() !== userId.toString() ||(u.userId.toString() === userId.toString() && u.maxCount <= u.usageCount));
  
  if (isUserNotEligible) {
    return { message: "User is not eligible to use this coupon or you consumed all your tries", error: true };
  }


  return { error: false, coupon };
}



export const applyCoupon = (subTotal, coupon) => {
  let total = subTotal;

  const { couponAmount: discountAmount, couponType: discountType } = coupon;

  if (discountAmount && discountType) {
    if (discountType == CouponType.PERCENTAGE) {
      total = subTotal - (subTotal * discountAmount / 100);
    } else if (discountType == CouponType.FIXED) {
      if (discountAmount > subTotal) {
        return total;
      }
      total = subTotal - discountAmount;
    }
  }

  return total;
}