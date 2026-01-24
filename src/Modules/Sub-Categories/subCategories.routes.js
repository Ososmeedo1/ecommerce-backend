import { Router } from "express";
import { multerHost, auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as subCategoryController from './subCategories.controller.js';
import * as subCategorySchema from './subCategories.schema.js';
import { extensions } from "../../Utils/index.js";


const subCategoryRouter = Router();

subCategoryRouter.post('/add', multerHost([...extensions.Images]).single('image'), auth(['Admin']), validationMiddleware(subCategorySchema.addSubCategory), errorHandle(subCategoryController.addSubCategory));
subCategoryRouter.get('/specific', auth(), validationMiddleware(subCategorySchema.getSubCategory), errorHandle(subCategoryController.getSubCategory));
subCategoryRouter.put('/:_id', multerHost([...extensions.Images]).single('image'), auth(['Admin']), validationMiddleware(subCategorySchema.updateSubCategory), errorHandle(subCategoryController.updateSubCategory));
subCategoryRouter.delete('/:_id', auth(['Admin']), validationMiddleware(subCategorySchema.deleteSubCategory), errorHandle(subCategoryController.deleteSubCategory));
subCategoryRouter.get('/', auth(), validationMiddleware(subCategorySchema.listSubCategories), errorHandle(subCategoryController.listSubCategories));


export { subCategoryRouter };