import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";



export const addBrand = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).trim().required().messages(validationMessages('Brand Name', "string", 2, 100)),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),

  query: Joi.object({
    category: generalRules.ObjectId.required().messages(validationMessages('Category ID', "string", 24, 24)),
    subCategory: generalRules.ObjectId.required().messages(validationMessages('SubCategory ID', "string", 24, 24)),
  })
}

export const getBrand = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),

  query: Joi.object({
    id: generalRules.ObjectId.optional().messages(validationMessages('Brand ID', "string")),
    slug: Joi.string().min(2).max(100).trim().optional().messages(validationMessages('Brand Slug', "string", 2, 100)),
    name: Joi.string().min(2).max(100).trim().optional().messages(validationMessages('Brand Name', "string", 2, 100)),
  })
}

export const updateBrand = {
  params: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages('Brand ID', "string")),
  }),

  body: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional().messages(validationMessages('Brand Name', "string", 2, 100)),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),
}

export const deleteBrand = {
  params: Joi.object({
    _id: generalRules.ObjectId.required().messages(validationMessages('Brand ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),
}

export const getAllRelatedBrands = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),

  query: Joi.object({
    category: generalRules.ObjectId.optional().messages(validationMessages('Category ID', "string", 24, 24)),
    subCategory: generalRules.ObjectId.optional().messages(validationMessages('SubCategory ID', "string", 24, 24)),
  })
}

export const getAllBrands = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true),
}