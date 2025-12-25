import Joi from "joi";
import { CouponType, generalRules } from "../../Utils/index.js";

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required(),
    from: Joi.date().greater(Date.now()).required(),
    till: Joi.date().greater(Joi.ref('from')).required(),
    Users: Joi.array().items(Joi.object({
      userId: generalRules.ObjectId.required(),
      maxCount: Joi.number().min(1).required()
    })).required(),
    couponType: Joi.string().valid(...Object.values(CouponType)).required(),
    couponAmount: Joi.number().when('couponType', {
      is: Joi.string().valid(CouponType.PERCENTAGE),
      then: Joi.number().max(100).required()
    }).min(1).required().messages({
      "number.min": "Coupon amount must be more than 0",
      "number.max": "Coupon amount must be less that 100"
    })
  })
}

export const updateCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().optional(),
    from: Joi.date().greater(Date.now()).optional(),
    till: Joi.date().greater(Joi.ref('from')).optional(),
    Users: Joi.array().items(Joi.object({
      userId: generalRules.ObjectId.optional(),
      maxCount: Joi.number().min(1).optional()
    })).optional(),
    couponType: Joi.string().valid(...Object.values(CouponType)).optional(),
    couponAmount: Joi.number().when('couponType', {
      is: Joi.string().valid(CouponType.PERCENTAGE),
      then: Joi.number().max(100).optional()
    }).optional().min(1).messages({
      'number.min': "Coupon amount must be more than 0",
      'number.max': "Coupon amount must be less than 100"
    })
  }),

  params: Joi.object({
    couponId: generalRules.ObjectId.required()
  }),

  user: Joi.object({
    _id: generalRules.ObjectId.required()
  }).options({ allowUnknown: true })
}