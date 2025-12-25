import { ErrorHandlerClass } from "../Utils/index.js";


const reqKeys = ["body", "params", "query", "headers", "file", "files", "authUser"];


export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    let validationErrors = [];

    for (const key of reqKeys) {
      const validationResult = schema[key]?.validate(req[key], { abortEarly: false });

      if (validationResult?.error) {

        // validationResult.error.details.map(err => {
        //   validationErrors.push(err.message)
        // })
        validationErrors.push(validationResult.error.details)
      }
    }

    validationErrors.length ? next(new ErrorHandlerClass("Validation Error", 400, validationErrors)) : next();
  }
}