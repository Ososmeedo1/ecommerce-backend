import { ErrorHandlerClass } from "./../Utils/index.js"



export const errorHandle = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch((error) => {
      next(new ErrorHandlerClass("Internal Server Error", 500, error.stack, "Error handle middleware"))
    })
  }
}

export const globalResponse = (error, req, res, next) => {
  if (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
      error: error.data,
      stack: error.stack
    })
  }
}