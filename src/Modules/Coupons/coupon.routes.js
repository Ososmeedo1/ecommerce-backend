import { Router } from "express";
import * as couponControllers from './coupon.controller.js';
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as couponSchema from './coupon.schema.js';

const couponRouter = Router();

couponRouter.post('/add', auth(), validationMiddleware(couponSchema.addCouponSchema), errorHandle(couponControllers.addCoupon));
couponRouter.get('/', auth(), validationMiddleware(couponSchema.getCouponsSchema), errorHandle(couponControllers.getCoupons));
couponRouter.get('/:couponId', auth(), validationMiddleware(couponSchema.getCouponByIdSchema), errorHandle(couponControllers.getCouponById));
couponRouter.put('/update/:couponId', validationMiddleware(couponSchema.updateCouponSchema), auth(), errorHandle(couponControllers.updateCoupon));

export { couponRouter };