import { Router } from "express";
import * as orderController from './order.controller.js';
import { auth, errorHandle } from "../../Middlewares/index.js";


const orderRouter = Router();

orderRouter.post('/add', auth(), errorHandle(orderController.addOrder));

export { orderRouter };