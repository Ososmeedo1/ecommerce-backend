import { Router } from "express";
// utils
import { extensions } from "../../Utils/index.js";
// controllers
import * as productController from './products.controller.js'
// models
import { Brand } from "../../../DB/Models/index.js";
// middlewares
import * as Middlewares from './../../Middlewares/index.js'

const productRouter = Router();

const {multerHost, errorHandle, checkIfIdsExist} = Middlewares;

productRouter.post('/add', multerHost(extensions.Images).array("images", 5), checkIfIdsExist(Brand), errorHandle(productController.addProduct))
productRouter.put('/update/:productId', errorHandle(productController.updateProduct))
productRouter.get('/list', errorHandle(productController.listProducts))
productRouter.get('/:_id', errorHandle(productController.getSpecificProduct))
productRouter.delete('/:_id', errorHandle(productController.deleteProduct))


export { productRouter };