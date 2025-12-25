
import mongoose from "mongoose";
import { ReviewStatus } from "../../src/Utils/index.js";


const { Schema, models, model } = mongoose;


const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    reviewRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    reviewBody: String,
    reviewStatus: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.Pending
    },
    actionDoneBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    versionKey: false
  })

export const Review = models.Review || model("Review", reviewSchema);