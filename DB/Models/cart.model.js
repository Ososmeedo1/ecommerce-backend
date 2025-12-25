import mongoose from "mongoose";
import { calcCartTotal } from "../../src/Modules/Cart/Utils/cart.utils.js";



const { Schema, model, models, Types } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    products: [{

      productId: {
        type: Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
    ],
    subTotal: Number
  },
  {
    timestamps: true,
    versionKey: false
  });


cartSchema.pre('svae', function (next) {
  this.subTotal = calcCartTotal(this.products)
  next();
})

cartSchema.post('save', async function (doc) {
  if (doc.products.length == 0) {
    await Cart.deleteOne({ userId: doc.userId });
  }
})

export const Cart = models.Cart || model("Cart", cartSchema)