import Joi from "joi"
import { generalRules, UserType, validationMessages } from "../../Utils/index.js"

// Shared by register, update, reset and change-password so the policy cannot
// drift between endpoints.
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@!%*?&#])[A-Za-z\d@!%*?&#]{8,}$/;
const PASSWORD_MESSAGE = "at least one uppercase letter, one lowercase letter, one digit, and one special character (@!%*?&#)";



export const register = {
  body: Joi.object({
    username: Joi.string().min(5).max(20).optional().messages(validationMessages("username", "string", 5, 20)),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required().lowercase().messages(validationMessages("email", "string")),
    password: Joi.string().regex(PASSWORD_PATTERN).required().messages(validationMessages("password", "string", 8, null, PASSWORD_MESSAGE)),
    age: Joi.number().min(12).max(100).optional().messages(validationMessages("age", "number", 12, 100)),
    userType: Joi.string().valid(...Object.values(UserType)).required().messages(validationMessages("user type", "string", null, null, "role must be Buyer or Admin")),
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
    password: Joi.string().regex(PASSWORD_PATTERN).optional().messages(validationMessages("password", "string", 8, null, PASSWORD_MESSAGE)),
    currentPassword: Joi.string().optional().messages(validationMessages("current password", "string")),
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

export const forgotPassword = {
  body: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required().lowercase().messages(validationMessages("email", "string")),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const verifyOtp = {
  body: Joi.object({
    otp: Joi.string().pattern(/^[A-Za-z0-9]{6}$/).required().messages(validationMessages("otp", "string", 6, 6, "otp must be a 6-character code")),
    // `otpToken` is the storefront contract; `token` remains accepted for
    // clients built against the older reference API.
    otpToken: Joi.string().min(32).max(512).optional().messages(validationMessages("otp token", "string", 32, 512)),
    token: Joi.string().min(32).max(512).optional().messages(validationMessages("token", "string", 32, 512)),
  }).or("otpToken", "token"),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const resetPassword = {
  body: Joi.object({
    resetToken: Joi.string().min(32).max(512).required().messages(validationMessages("reset token", "string", 32, 512)),
    newPassword: Joi.string().regex(PASSWORD_PATTERN).required().messages(validationMessages("password", "string", 8, null, PASSWORD_MESSAGE)),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}

export const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages(validationMessages("current password", "string")),
    newPassword: Joi.string().regex(PASSWORD_PATTERN).required().messages(validationMessages("password", "string", 8, null, PASSWORD_MESSAGE)),
  }),

  headers: Joi.object({
    ...generalRules.headers
  }).unknown(true)
}
