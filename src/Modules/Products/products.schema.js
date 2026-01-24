import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";



export const addProduct = {
  body: Joi.object({
    title: Joi.string().min(3).max(100).required().messages(validationMessages('Title', "string", 3, 100)),
    overview: Joi.string().min(10).max(1000).required().messages(validationMessages('Overview', "string", 10, 1000)),
    specs: Joi.string().required().messages(validationMessages('Specs', "object")),
    price: Joi.number().min(50).required().messages(validationMessages('Price', "number", 50)),
    discountAmount: Joi.number().min(0).default(0).messages(validationMessages('Discount Amount', "number", 0)),
    discountType: Joi.string().valid('PERCENTAGE', 'FIXED').default('PERCENTAGE').messages(validationMessages('Discount Type', "string")),
    stock: Joi.number().min(10).required().messages(validationMessages('Stock', "number", 10)),
  }),


  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const updateProduct = {
  body: Joi.object({
    title: Joi.string().min(3).max(100).optional().messages(validationMessages('Title', "string", 3, 100)),
    overview: Joi.string().min(10).max(1000).optional().messages(validationMessages('Overview', "string", 10, 1000)),
    specs: Joi.object().optional().messages(validationMessages('Specs', "object")),
    price: Joi.number().min(50).optional().messages(validationMessages('Price', "number", 50)),
    discountAmount: Joi.number().min(0).optional().messages(validationMessages('Discount Amount', "number", 0)),
    discountType: Joi.string().valid('PERCENTAGE', 'FIXED').optional().messages(validationMessages('Discount Type', "string")),
    stock: Joi.number().min(10).optional().messages(validationMessages('Stock', "number", 10)),
  }),

  params: Joi.object({
    productId: generalRules.ObjectId.messages(validationMessages('Product ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const listProducts = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const getAndDeleteSpecificProduct = {
  params: Joi.object({
    _id: generalRules.ObjectId.messages(validationMessages('Product ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

