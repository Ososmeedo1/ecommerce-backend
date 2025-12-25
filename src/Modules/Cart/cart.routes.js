import { Router } from "express";
import * as cartController from './cart.controller.js'
import { auth, errorHandle } from "../../Middlewares/index.js";

const cartRouter = Router();

cartRouter.post("/add/:productId", auth(), errorHandle(cartController.addToCart));
cartRouter.patch("/remove/:productId", auth(), errorHandle(cartController.removeFromCart));
cartRouter.patch("/update/:productId", auth(), errorHandle(cartController.updateCart));
cartRouter.get("/", auth(), errorHandle(cartController.getCart));

export { cartRouter };