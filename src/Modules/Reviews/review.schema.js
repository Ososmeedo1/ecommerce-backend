import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";



export const addReview = {
  body: Joi.object({
    productId: Joi.string().hex().length(24).required().messages(validationMessages("Product ID", "string")),
    reviewRating: Joi.number().min(0).max(5).required().messages(validationMessages("Review Rating", "number")),
    reviewBody: Joi.string().allow("").optional().messages(validationMessages("Review Body", "string"))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const listReviews = {
  headers: Joi.object({
    ...generalRules.headers,
    ...generalRules.adminAuth
  }).unknown(true)
}

export const approveOrRejectReview = {
  params: Joi.object({
    reviewId: generalRules.ObjectId.required().messages(validationMessages("Review ID", "string"))
  }),

  body: Joi.object({
    action: Joi.string().valid("accepted", "rejected").required().messages(validationMessages("Action", "string"))
  }),

  headers: Joi.object({
    ...generalRules.headers,
  }).unknown(true)
}