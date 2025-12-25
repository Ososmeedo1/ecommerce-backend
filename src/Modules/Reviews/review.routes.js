import { Router } from "express";
import { auth, errorHandle } from "../../Middlewares/index.js";
import * as reviewController from './review.controller.js';


const reviewRouter = Router();

reviewRouter.post('/add', auth(), errorHandle(reviewController.addReview))
reviewRouter.get('/', auth(["Admin"]), errorHandle(reviewController.listReviews))
reviewRouter.patch('/action/:reviewId', auth(["Admin"]), errorHandle(reviewController.approveOrRejectReview))

export { reviewRouter };