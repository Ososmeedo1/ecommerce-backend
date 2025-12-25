import Joi from "joi";
import { generalRules, validationMessages } from "./../../Utils/index.js";



export const addCategory = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20).trim().messages(validationMessages("name")),
  }),
}








