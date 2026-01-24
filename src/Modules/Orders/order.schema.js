import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";



export const addOrder = {
  body: Joi.object({
    address: Joi.string().optional().messages(validationMessages('address', 'string')),
    contactNumber: Joi.string().pattern(/^01[0125][0-9]{8}$/).required().messages(validationMessages('contactNumber', 'string', null, null, "Enter valid Egyptian phone number")),
    couponCode: Joi.string().optional().messages(validationMessages('couponCode', 'string')),
    shippingFee: Joi.number().min(0).required().messages(validationMessages('shippingFee', 'number')),
    VAT: Joi.number().min(0).required().messages(validationMessages('VAT', 'number')),
    paymentMethod: Joi.string().valid('cash', 'card').required().messages(validationMessages('paymentMethod', 'string'))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const cancelAndGetOrder = {
  params: Joi.object({
    orderId: generalRules.ObjectId.required().messages(validationMessages('orderId', 'string'))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const getUserOrders = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}