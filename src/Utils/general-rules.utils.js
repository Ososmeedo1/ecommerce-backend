import Joi from "joi";
import { Types } from "mongoose"


const objectIdRule = (value, helper) => {
  const isObjectIdValid = Types.ObjectId.isValid(value);
  return isObjectIdValid ? value : helper.message("Invalid object id");
}

export const generalRules = {
  ObjectId: Joi.string().custom(objectIdRule),
  headers: {
    "content-type": Joi.string().valid("application/json").optional(),
    "user-agent": Joi.string().optional(),
    host: Joi.string().optional(),
    "content-length": Joi.number().optional(),
    "accept-encoding": Joi.string().optional(),
    accept: Joi.string().optional(),
    connection: Joi.string().optional(),
    "postman-token": Joi.string().optional(),
    token: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/).optional()
  }
}