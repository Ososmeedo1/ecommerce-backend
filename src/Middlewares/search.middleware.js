import { ErrorHandlerClass } from "../Utils/error-class.utils.js";


export const getModelByName = (model) => {
  return async (req, res, next) => {
    const { name } = req.body;

    if (name) {
      const document = await model.findOne({ name });

      if (document) {
        return next(new ErrorHandlerClass(`This ${model.modelName} already exists`, 400));
      }
    }

    next();
  }
}

export const checkIfIdsExist = (model) => {
  return async (req, res, next) => {
    const { category, subCategory, brand } = req.query;
    
      const document = await model.findOne({ _id: brand, subCategoryId: subCategory, categoryId: category }).populate([
        {path: "categoryId", select: "customId"},
        {path: "subCategoryId", select: "customId"}
      ]);
    
      if (!document) {
        return next(new ErrorHandlerClass(`${model.modelName} not found`, 404));
      }

      req.document = document;

      next();
  }
}
