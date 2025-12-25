import { Router } from "express";
import * as couponControllers from './coupon.controller.js';
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as couponSchema from './coupon.schema.js';

const couponRouter = Router();

couponRouter.post('/add', auth(), validationMiddleware(couponSchema.addCouponSchema), errorHandle(couponControllers.addCoupon));
couponRouter.get('/', auth(), errorHandle(couponControllers.getCoupons));
couponRouter.get('/:couponId', auth(), errorHandle(couponControllers.getCouponById));
couponRouter.put('/update/:couponId', validationMiddleware(couponSchema.updateCouponSchema), auth(), errorHandle(couponControllers.updateCoupon));
couponRouter.patch('/enable/:couponId', auth(), errorHandle(couponControllers.disableEnableCoupon));

export { couponRouter };