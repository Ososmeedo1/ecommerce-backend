import { Router } from "express";
import { multerHost, errorHandle, auth, validationMiddleware } from "../../Middlewares/index.js";
import { extensions } from "../../Utils/index.js";
import * as brandsController from './brands.controller.js'
import * as brandSchema from './brands.schema.js'

const brandRouter = Router();

brandRouter.post('/add', multerHost(extensions.Images).single("image"), auth(['Admin']), validationMiddleware(brandSchema.addBrand), errorHandle(brandsController.addBrand));
brandRouter.get('/specific', auth(), validationMiddleware(brandSchema.getBrand), errorHandle(brandsController.getBrand));
brandRouter.put('/:_id', multerHost(extensions.Images).single("image"), auth(['Admin']), validationMiddleware(brandSchema.updateBrand), errorHandle(brandsController.updateBrand));
brandRouter.delete('/:_id', auth(['Admin']), validationMiddleware(brandSchema.deleteBrand), errorHandle(brandsController.deleteBrand));


export { brandRouter };