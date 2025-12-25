import { Router } from "express";
import { multerHost, auth, errorHandle } from "../../Middlewares/index.js";
import * as subCategoryController from './subCategories.controller.js'
import { extensions } from "../../Utils/index.js";


const subCategoryRouter = Router();

subCategoryRouter.post('/add', multerHost([...extensions.Images]).single('image'), auth(['Admin']), errorHandle(subCategoryController.addSubCategory));
subCategoryRouter.get('/specific', errorHandle(subCategoryController.getSubCategory));
subCategoryRouter.put('/:_id', multerHost([...extensions.Images]).single('image'), auth(['Admin']), errorHandle(subCategoryController.updateSubCategory));
subCategoryRouter.delete('/:_id', auth(['Admin']), errorHandle(subCategoryController.deleteSubCategory));
subCategoryRouter.get('/', errorHandle(subCategoryController.listSubCategories));


export { subCategoryRouter };