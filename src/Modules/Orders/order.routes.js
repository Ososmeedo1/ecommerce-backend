import { Router } from "express";
import * as orderController from './order.controller.js';
import * as orderSchema from './order.schema.js';
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";


const orderRouter = Router();

orderRouter.post('/add', auth(), validationMiddleware(orderSchema.addOrder), errorHandle(orderController.addOrder));
orderRouter.get('/cancel/:orderId', auth(), validationMiddleware(orderSchema.cancelAndGetOrder), errorHandle(orderController.cancelOrder));
orderRouter.get('/deliver/:orderId', auth(), validationMiddleware(orderSchema.cancelAndGetOrder), errorHandle(orderController.orderDelivered));
orderRouter.get('/', auth(), validationMiddleware(orderSchema.getUserOrders), errorHandle(orderController.getUserOrders));
orderRouter.get('/:orderId', auth(), validationMiddleware(orderSchema.cancelAndGetOrder), errorHandle(orderController.getOrderDetails));

export { orderRouter };