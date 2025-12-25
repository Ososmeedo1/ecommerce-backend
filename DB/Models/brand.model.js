import mongoose from "./../global-setup.js";


const {Schema, model, models, Types} = mongoose;


const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    addedBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: false // To change it to true after adding User Module
    },
    logo: {
      fileUrl: {
        type: String,
        required: true
      },
      filePath: {
        type: String,
        required: true,
        unique: true
      }
    },
    customId: {
      type: String,
      required: true,
      unique: true
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
    }
  },
  {
    timestamps: true
  })

  export const Brand = models.Brand || model('Brand', brandSchema);