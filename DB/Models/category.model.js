import slugify from "slugify";
import mongoose from "./../global-setup.js";

const { Schema, model, models } = mongoose;


const categorySchema = new Schema(
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
      default: () => {
        return slugify(this.name, { lower: true, replacement: "_" })
      }
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true // To change it to true after adding User Module
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
    }

  },
  { timestamps: true }
);


categorySchema.post('findOneAndDelete', async function () {

  const _id = this.getFilter()._id;

  // delete related subcategories from db

  const deletedSubCategories = await models.SubCategory.deleteMany({ categoryId: _id })

  if (deletedSubCategories.deletedCount) {

    // delete related brands from db

    const deletedBrands = await models.Brand.deleteMany({ categoryId: _id })

    if (deletedBrands.deletedCount) {

      // delete related products from db

      await models.Product.deleteMany({ categoryId: _id })
    }

  }
})

categorySchema.pre('validate', function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, replacement: '_' });
  }
  next();
});

export const Category = models.Category || model('Category', categorySchema);