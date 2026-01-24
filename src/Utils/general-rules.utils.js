import Joi from "joi";
import { Types } from "mongoose"


const objectIdRule = (value, helper) => {
  const isObjectIdValid = Types.ObjectId.isValid(value);
  return isObjectIdValid ? value : helper.message("Invalid object id");
}

export const generalRules = {
  ObjectId: Joi.string().custom(objectIdRule),
  headers: {
    "content-type": Joi.string().pattern(/^application\/json|multipart\/form-data/).optional(),
    "user-agent": Joi.string().optional(),
    host: Joi.string().optional(),
    "content-length": Joi.number().optional(),
    "accept-encoding": Joi.string().optional(),
    accept: Joi.string().optional(),
    connection: Joi.string().optional(),
    "postman-token": Joi.string().optional(),
    "request-start-time": Joi.string().optional(),
    "cache-control": Joi.string().optional(),
    token: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/).optional(),
    "sec-ch-ua-platform": Joi.string().optional(),
    "sec-ch-ua": Joi.string().optional(),
    "sec-ch-ua-mobile": Joi.string().optional(),
    "origin": Joi.string().optional(),
    "sec-fetch-site": Joi.string().optional(),
    "sec-fetch-mode": Joi.string().optional(),
    "sec-fetch-dest": Joi.string().optional(),
    "referer": Joi.string().optional(),
    "accept-language": Joi.string().optional(),
    "if-none-match": Joi.string().optional()
  }
}