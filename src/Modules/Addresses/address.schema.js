import Joi from "joi";
import { generalRules, validationMessages } from "../../Utils/index.js";


export const addAddress = {
  body: Joi.object({
    country: Joi.string().min(2).max(100).required().messages(validationMessages('Country', "string", 2, 100)),
    city: Joi.string().min(2).max(100).required().messages(validationMessages('City', "string", 2, 100)),
    postalCode: Joi.number().min(2).max(1000000).required().messages(validationMessages('Postal Code', "number", 2, 1000000)),
    buildingNumber: Joi.string().min(1).max(20).required().messages(validationMessages('Building Number', "string", 1, 20)),
    floorNumber: Joi.number().min(1).max(20).required().messages(validationMessages('Floor Number', "number", 1, 20)),
    addressLabel: Joi.string().min(2).max(50).required().messages(validationMessages('Address Label', "string", 2, 50)),
    setAsDefault: Joi.boolean().optional().messages(validationMessages('Set As Default', "boolean")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const updateAddress = {
  body: Joi.object({
    country: Joi.string().min(2).max(100).optional().messages(validationMessages('Country', "string", 2, 100)),
    city: Joi.string().min(2).max(100).optional().messages(validationMessages('City', "string", 2, 100)),
    postalCode: Joi.number().min(2).max(1000000).optional().messages(validationMessages('Postal Code', "number", 2, 1000000)),
    buildingNumber: Joi.string().min(1).max(20).optional().messages(validationMessages('Building Number', "string", 1, 20)),
    floorNumber: Joi.number().min(1).max(20).optional().messages(validationMessages('Floor Number', "number", 1, 20)),
    addressLabel: Joi.string().min(2).max(50).optional().messages(validationMessages('Address Label', "string", 2, 50)),
    setAsDefault: Joi.boolean().optional().messages(validationMessages('Set As Default', "boolean")),
  }),

  params: Joi.object({
    addressId: generalRules.ObjectId.messages(validationMessages('Address ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const deleteAddress = {
  params: Joi.object({
    addressId: generalRules.ObjectId.messages(validationMessages('Address ID', "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const getAllAddresses = {
  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}