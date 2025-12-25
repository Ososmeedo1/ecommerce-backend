import { Order, Product, Review } from "../../../DB/Models/index.js";
import { ErrorHandlerClass, OrderStatus, ReviewStatus } from "../../Utils/index.js";


export const addReview = async (req, res, next) => {
  const { productId, reviewRating, reviewBody } = req.body;
  const userId = req.user._id;
  // check if user already reviewed this product
  // check if product exists
  // check if user bought this product

  const isAlreadyReviewed = await Review.findOne({ userId, productId });

  if (isAlreadyReviewed) {
    return next(new ErrorHandlerClass("You have already reviewed this product", 400))
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandlerClass("Product not exists", 404));
  }

  const wasBought = await Order.findOne({ userId, "products.productId": productId, orderStatus: OrderStatus.Delivered });

  if (!wasBought) {
    return next(new ErrorHandlerClass("You have not bought this product"))
  }

  const review = new Review({
    userId,
    productId,
    reviewRating,
    reviewBody
  })

  await review.save();

  res.status(201).json({ message: "Review added successfully", data: review });

}

export const listReviews = async (req, res, next) => {

  const reviews = await Review.find().populate([{ path: 'userId', select: "userName email -_id" }, { path: "productId", select: "title -_id" }]);

  if (reviews.length == 0) {
    return next(new ErrorHandlerClass("No Reviews yet", 404));
  }

  res.status(200).json({ message: "done", data: reviews })
}

export const approveOrRejectReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { action } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new ErrorHandlerClass("Review not exists", 404));
  }

  if (action == ReviewStatus.Accepted) {
    review.reviewStatus = ReviewStatus.Accepted;
    await review.save();
    return res.status(200).json({ message: "Review has been accepted successfully", data: review });
  } else if (action == ReviewStatus.Rejected) {
    review.reviewStatus = ReviewStatus.Rejected;
    await review.save();
    return res.status(200).json({ message: "Review has been rejected successfully" });
  }

  res.status(200).json({ message: "Review status has not been changed" });

}