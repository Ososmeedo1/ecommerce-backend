import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";


export const addToCart = {
  body: Joi.object({
    quantity: Joi.number().min(1).required().messages(validationMessages('Quantity', "number", 1)),
  }),

  params: Joi.object({
    productId: generalRules.ObjectId.required().messages(validationMessages('Product ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const removeFromCart = {
  params: Joi.object({
    productId: generalRules.ObjectId.required().messages(validationMessages('Product ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const updateCart = {
  body: Joi.object({
    quantity: Joi.number().min(1).required().messages(validationMessages('Quantity', "number", 1)),
  }),

  params: Joi.object({
    productId: generalRules.ObjectId.required().messages(validationMessages('Product ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const getCart = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}