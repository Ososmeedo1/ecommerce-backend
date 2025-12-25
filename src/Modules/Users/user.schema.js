import Joi from "joi"
import { UserType, validationMessages } from "../../Utils/index.js"



export const register = {
  body: Joi.object({
    username: Joi.string().min(5).max(20).optional(),
    email: Joi.string().email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'org']}}).required().lowercase().messages(validationMessages("email")),
    password: Joi.string().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@!%*?&#])[A-Za-z\d@!%*?&#]{8,}$/).required().messages({"string.pattern.base": " must be at least 8 characters including at least one capital letter, one small letter, one digit, one symbol from these @ ! % * ? & #"}),
    age: Joi.number().min(12).max(100).optional().messages({"number.min" : "Your age must be at least 11 years old", "number.max": "Your age must not be more than 100 years old"}),
    userType: Joi.string().valid('Buyer', 'Admin').required().messages({"any.only": "role must be Buyer or Admin"}),
    gender: Joi.string().valid('male', 'female').required().messages({"any.only": "Your gender must be male or female"}),
    phone: Joi.string().regex(/^01[0125][0-9]{8}$/).optional().messages({"string.pattern.base": "enter valid egyptian number"}),
    country: Joi.string().required().min(3).max(50),
    city: Joi.string().required().min(3).max(50),
    postalCode: Joi.string().required().messages(validationMessages("postal code")),
    buildingNumber: Joi.string().required().messages(validationMessages("building number")),
    floorNumber: Joi.number().required().min(0).max(120).messages({"number.min": "floor number must be at least 0", "number.max": "floor number must not more than 120"}),
    addressLabel: Joi.string().optional()
  })
}