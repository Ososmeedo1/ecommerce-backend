import Joi from "joi"
import { generalRules, UserType, validationMessages } from "../../Utils/index.js"



export const register = {
  body: Joi.object({
    username: Joi.string().min(5).max(20).optional().messages(validationMessages("username", "string", 5, 20)),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required().lowercase().messages(validationMessages("email", "string")),
    password: Joi.string().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@!%*?&#])[A-Za-z\d@!%*?&#]{8,}$/).required().messages(validationMessages("password", "string", 8, null, "at least one uppercase letter, one lowercase letter, one digit, and one special character (@!%*?&#)")),
    age: Joi.number().min(12).max(100).optional().messages(validationMessages("age", "number", 12, 100)),
    userType: Joi.string().valid('Buyer', 'Admin').required().messages(validationMessages("user type", "string", null, null, "role must be Buyer or Admin")),
    gender: Joi.string().valid('male', 'female').required().messages(validationMessages("gender", "string", null, null, "gender must be male or female")),
    phone: Joi.string().regex(/^01[0125][0-9]{8}$/).optional().messages(validationMessages("phone", "string", null, null, "phone must be a valid Egyptian mobile number")),
    country: Joi.string().required().min(3).max(50).messages(validationMessages("country", "string", 3, 50)),
    city: Joi.string().required().min(3).max(50).messages(validationMessages("city", "string", 3, 50)),
    postalCode: Joi.string().required().messages(validationMessages("postal code", "string")),
    buildingNumber: Joi.string().required().messages(validationMessages("building number", "string")),
    floorNumber: Joi.number().required().min(0).max(120).messages(validationMessages("floor number", "number", 0, 120)),
    addressLabel: Joi.string().optional().messages(validationMessages("address label", "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const login = {
  body: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required().lowercase().messages(validationMessages("email", "string")),
    password: Joi.string().required().messages(validationMessages("password", "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const updateAccount = {

  body: Joi.object({
    password: Joi.string().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@!%*?&#])[A-Za-z\d@!%*?&#]{8,}$/).optional().messages(validationMessages("password", "string", 8, null, "at least one uppercase letter, one lowercase letter, one digit, and one special character (@!%*?&#)")),
    username: Joi.string().min(5).max(20).optional().messages(validationMessages("username", "string", 5, 20)),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).optional().lowercase().messages(validationMessages("email", "string")),
    age: Joi.number().min(12).max(100).optional().messages(validationMessages("age", "number", 12, 100)),
    userType: Joi.string().valid(...Object.values(UserType)).optional().messages(validationMessages("user type", "string", null, null, `role must be one of: ${Object.values(UserType).join(', ')}`)),
    gender: Joi.string().valid('male', 'female').optional().messages(validationMessages("gender", "string", null, null, "gender must be male or female")),
    phone: Joi.string().regex(/^01[0125][0-9]{8}$/).optional().messages(validationMessages("phone", "string", null, null, "phone must be a valid Egyptian mobile number")),
    country: Joi.string().optional().min(3).max(50).messages(validationMessages("country", "string", 3, 50)),
    city: Joi.string().optional().min(3).max(50).messages(validationMessages("city", "string", 3, 50)),
    postalCode: Joi.string().optional().messages(validationMessages("postal code", "string")),
    buildingNumber: Joi.string().optional().messages(validationMessages("building number", "string")),
    floorNumber: Joi.number().optional().min(0).max(120).messages(validationMessages("floor number", "number", 0, 120)),
    addressLabel: Joi.string().optional().messages(validationMessages("address label", "string")),
  }).min(1),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const userAccount = {

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}