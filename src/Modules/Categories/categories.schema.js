import Joi from "joi";
import { generalRules, validationMessages } from "./../../Utils/index.js";



export const addCategory = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20).trim().messages(validationMessages("name", "string", 3, 20))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const getCategory = {
  query: Joi.object({
    id: generalRules.ObjectId.optional().messages(validationMessages("category ID", "string", 24, 24)),
    name: Joi.string().optional().min(3).max(20).trim().messages(validationMessages("name", "string", 3, 20)),
    slug: Joi.string().optional().min(3).max(30).trim().messages(validationMessages("slug", "string", 3, 30))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const updateCategory = {
  body: Joi.object({
    name: Joi.string().optional().min(3).max(20).trim().messages(validationMessages("name", "string", 3, 20))
  }).min(1),

  params: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages("category ID", "string", 24, 24))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const deleteCategory = {
  params: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages("category ID", "string", 24, 24))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const listCategories = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}






