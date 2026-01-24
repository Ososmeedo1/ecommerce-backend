import { Router } from "express";
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as reviewController from './review.controller.js';
import * as reviewSchema from './review.schema.js';

const reviewRouter = Router();

reviewRouter.post('/add', auth(), validationMiddleware(reviewSchema.addReview), errorHandle(reviewController.addReview))
reviewRouter.get('/', auth(["Admin"]), validationMiddleware(reviewSchema.listReviews), errorHandle(reviewController.listReviews))
reviewRouter.patch('/action/:reviewId', auth(["Admin"]), validationMiddleware(reviewSchema.approveOrRejectReview), errorHandle(reviewController.approveOrRejectReview))

export { reviewRouter };