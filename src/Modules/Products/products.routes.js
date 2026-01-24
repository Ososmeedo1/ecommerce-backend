import { Router } from "express";
import { extensions } from "../../Utils/index.js";
import * as productController from './products.controller.js'
import * as productSchema from './products.schema.js';
import { auth, checkIfIdsExist, errorHandle, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import { Brand } from "../../../DB/Models/index.js";

const productRouter = Router();

productRouter.post('/add', multerHost(extensions.Images).array("images", 5), auth(['Admin']), validationMiddleware(productSchema.addProduct), checkIfIdsExist(Brand), errorHandle(productController.addProduct))
productRouter.put('/update/:productId', auth(['Admin']), validationMiddleware(productSchema.updateProduct), errorHandle(productController.updateProduct))
productRouter.get('/list', auth(), validationMiddleware(productSchema.listProducts), errorHandle(productController.listProducts))
productRouter.get('/:_id', auth(), validationMiddleware(productSchema.getAndDeleteSpecificProduct), errorHandle(productController.getSpecificProduct))
productRouter.delete('/:_id', auth(['Admin']), validationMiddleware(productSchema.getAndDeleteSpecificProduct), errorHandle(productController.deleteProduct))


export { productRouter };