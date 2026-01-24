import { Router } from "express";
import * as cartController from './cart.controller.js'
import * as cartSchema from './cart.schema.js'
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";

const cartRouter = Router();

cartRouter.post("/add/:productId", auth(), validationMiddleware(cartSchema.addToCart), errorHandle(cartController.addToCart));
cartRouter.patch("/remove/:productId", auth(), validationMiddleware(cartSchema.removeFromCart), errorHandle(cartController.removeFromCart));
cartRouter.patch("/update/:productId", auth(), validationMiddleware(cartSchema.updateCart), errorHandle(cartController.updateCart));
cartRouter.get("/", auth(), validationMiddleware(cartSchema.getCart), errorHandle(cartController.getCart));

export { cartRouter };