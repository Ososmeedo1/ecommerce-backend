import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";



export const addSubCategory = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages(validationMessages('name', "string", 2, 100))
  }),

  query: Joi.object({
    categoryId: generalRules.ObjectId.required().messages(validationMessages("category ID", "string", null, null, "Invalid category ID"))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const getSubCategory = {
  query: Joi.object({
    id: generalRules.ObjectId.optional().messages(validationMessages("sub-category ID", "string", 24, 24)),
    name: Joi.string().optional().min(2).max(100).trim().messages(validationMessages("name", "string", 2, 100)),
    slug: Joi.string().optional().min(2).max(100).trim().messages(validationMessages("slug", "string", 2, 100))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const updateSubCategory = {
  body: Joi.object({
    name: Joi.string().optional().min(2).max(100).trim().messages(validationMessages("name", "string", 2, 100))
  }),

  params: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages("sub-category ID", "string"))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const deleteSubCategory = {
  params: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages("sub-category ID", "string", 24, 24))
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const listSubCategories = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}