import mongoose from "mongoose";
import { CouponType } from "../../src/Utils/index.js";


const { Schema, models, model, Types } = mongoose;

const couponSchema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    couponAmount: {
      type: Number,
      required: true
    },
    couponType: {
      type: String,
      enum: Object.values(CouponType),
      required: true
    },
    from: {
      type: Date,
      require: true
    },
    till: {
      type: Date,
      require: true
    },
    Users: [
      {
        userId: {
          type: Types.ObjectId,
          ref: "User",
          required: true
        },
        maxCount: {
          type: Number,
          required: true,
          min: 1
        },
        usageCount: {
          type: Number,
          default: 0
        }
      }
    ],
    isEnabled: {
      type: Boolean,
      default: true
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  })

export const Coupon = models.Coupon || model('Coupon', couponSchema);


export const couponChangeLogSchema = new Schema(
  {
    couponId: {
      type: Types.ObjectId,
      ref: "Coupon",
      required: true
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    changes: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  })


export const CouponChangeLog = models.CouponChangeLog || model("CouponChangeLog", couponChangeLogSchema);