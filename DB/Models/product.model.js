import mongoose from "./../global-setup.js";
import slugify from "slugify";
import { Badges, DiscountType, calculateProductPrice } from "../../src/Utils/index.js";
import mongoosePagination from 'mongoose-paginate-v2'


const { Types, models, model, Schema } = mongoose;


const productSchema = new Schema(
  {
    // Strings Section
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      default: function () {
        return slugify(this.title, { lower: true, replacement: '_' });
      }
    },
    overview: String,
    specs: Object,
    badges: {
      type: String,
      enum: Object.values(Badges)
    },

    // Numbers section

    price: {
      type: Number,
      required: true,
      min: 50
    },
    appliedDiscount: {
      amount: {
        type: Number,
        min: 0,
        default: 0
      },

      type: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE
      }
    },
    appliedPrice: {
      type: Number,
      required: true,
      default: function () {
        return calculateProductPrice(this.price, this.appliedDiscount);
      }
    },
    stock: {
      type: Number,
      required: true,
      min: 10
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    Images: {
      URLs: [{
        fileUrl: {
          type: String,
          required: true
        },
        filePath: {
          type: String,
          required: true,
          unique: true
        }
      }
      ],
      customId: {
        type: String,
        required: true,
        unique: true
      }
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true
    },
    subCategoryId: {
      type: Types.ObjectId,
      ref: 'SubCategory',
      required: true
    },
    brandId: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false
    }


  },
  {
    timestamps: true,
    versionKey: false
  })

export const Product = models.Product || model('Product', productSchema);