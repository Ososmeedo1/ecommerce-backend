import { Router } from "express";
import { multerHost } from "../../Middlewares/multer.middleware.js";
import { extensions } from "../../Utils/index.js";
import { errorHandle } from "../../Middlewares/error-handle.middleware.js";
import * as brandsController from './brands.controller.js'
import { auth } from "../../Middlewares/auth.middleware.js";

const brandRouter = Router();

brandRouter.post('/add', multerHost(extensions.Images).single("image"), auth(['Admin']), errorHandle(brandsController.addBrand));
brandRouter.get('/specific', errorHandle(brandsController.getBrand));
brandRouter.put('/:_id', multerHost(extensions.Images).single("image"), errorHandle(brandsController.updateBrand));
brandRouter.delete('/:_id', errorHandle(brandsController.deleteBrand));


export { brandRouter };