import { Router } from "express";
import { multerHost, auth, errorHandle, getModelByName, validationMiddleware } from "../../Middlewares/index.js";
import * as categoriesController from './categories.controller.js'
import * as categoriesSchema from './categories.schema.js';
import { extensions } from "../../Utils/index.js";
import { Category } from "../../../DB/Models/index.js";

const categoryRouter = Router();

categoryRouter.post('/add', auth(['Admin']), multerHost([...extensions.Images]).single('image'), validationMiddleware(categoriesSchema.addCategory),  errorHandle(categoriesController.addCategory));
categoryRouter.get('/specific', errorHandle(categoriesController.getCategory));
categoryRouter.put('/update/:_id', multerHost([...extensions.Images]).single('image'), errorHandle(categoriesController.updateCategory));
categoryRouter.delete('/delete/:_id', errorHandle(categoriesController.deleteCategory));
categoryRouter.get('/list', errorHandle(categoriesController.listCategories));


export { categoryRouter };