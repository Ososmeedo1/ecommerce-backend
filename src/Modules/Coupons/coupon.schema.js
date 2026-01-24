import Joi from "joi";
import { CouponType, generalRules, validationMessages } from "../../Utils/index.js";
import { DateTime } from "luxon";

const minDateInTimezone = (value, helpers) => {
  const timezone = process.env.TIMEZONE || 'UTC';
  // Calculate the end of the current day in the specific timezone dynamically
  const limit = DateTime.now().setZone(timezone).startOf("day");
  if (DateTime.fromJSDate(value) < limit) {
    // Generate a standard Joi error for min date
    return helpers.error('date.min', { limit: limit.toJSDate() });
  }
  return value;
};

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().messages(validationMessages('Coupon Code', "string")),
    from: Joi.date().custom(minDateInTimezone).required()
      .messages({ 'date.base': 'From date must be a valid date', 'date.min': 'From date must be today or later' }),
    till: Joi.date().greater(Joi.ref('from')).required()
      .messages({ 'date.base': 'Till date must be a valid date', 'date.greater': "Till date must be after 'from' date" }),
    Users: Joi.array().items(Joi.object({
      userId: generalRules.ObjectId.required().messages(validationMessages('User ID', "string")),
      maxCount: Joi.number().min(1).required().messages(validationMessages('Max Count', "number", 1))
    })).required(),
    couponType: Joi.string().valid(...Object.values(CouponType)).required().messages(validationMessages('Coupon Type', "string")),
    couponAmount: Joi.number().when('couponType', {
      is: Joi.string().valid(CouponType.PERCENTAGE),
      then: Joi.number().max(100).required().messages(validationMessages('Coupon Amount', "number", 1, 100))
    }).min(1).required().messages(validationMessages('Coupon Amount', "number", 1))
  })
};

export const updateCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().optional().messages(validationMessages('Coupon Code', "string")),
    from: Joi.date().custom(minDateInTimezone).optional().messages(validationMessages('From', "date")),
    till: Joi.date().greater(Joi.ref('from')).optional().messages(validationMessages('Till', "date")),
    Users: Joi.array().items(Joi.object({
      userId: generalRules.ObjectId.optional().messages(validationMessages('User ID', "string")),
      maxCount: Joi.number().min(1).optional().messages(validationMessages('Max Count', "number", 1))
    })).optional(),
    couponType: Joi.string().valid(...Object.values(CouponType)).optional().messages(validationMessages('Coupon Type', "string")),
    couponAmount: Joi.number().when('couponType', {
      is: Joi.string().valid(CouponType.PERCENTAGE),
      then: Joi.number().max(100).optional()
    }).optional().min(1).messages(validationMessages('Coupon Amount', "number", 1))
  }),

  params: Joi.object({
    couponId: generalRules.ObjectId.required().messages(validationMessages('Coupon ID', "string")),
  }),

  user: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages('User ID', "string"))
  }).options({ allowUnknown: true }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
};

export const getCouponsSchema = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),
};

export const getCouponByIdSchema = {
  params: Joi.object({
    couponId: generalRules.ObjectId.required().messages(validationMessages('Coupon ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
};