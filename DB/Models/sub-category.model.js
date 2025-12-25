import mongoose from "./../global-setup.js";


const { Schema, model, models } = mongoose;


const subCategorySchema = new Schema(
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false // To change it to true after adding User Module
    },
    Image: {
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
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  {
    timestamps: true
  })

export const SubCategory = models.SubCategory || model('SubCategory', subCategorySchema);