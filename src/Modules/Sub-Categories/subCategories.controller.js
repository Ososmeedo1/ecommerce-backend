import slugify from "slugify";
import { nanoid } from "nanoid";
import { imageKitConfig, ErrorHandlerClass, ApiFeatures } from "../../Utils/index.js";
import fs from 'fs'
import { DateTime } from "luxon";
import { Brand, Category, SubCategory } from "../../../DB/Models/index.js";

export const addSubCategory = async (req, res, next) => {
  const { categoryId } = req.query;
  const { name } = req.body;

  // chech if category exists

  const category = await Category.findById(categoryId);

  if (!category) {
    return new ErrorHandlerClass("Category not found", 404)
  }

  const slug = slugify(name, {
    replacement: "_",
    lower: true
  })

  if (!req.file) {
    return new ErrorHandlerClass("Image is required", 404)
  }

  const customId = nanoid(4);

  // upload image

  const { url, filePath } = await imageKitConfig().upload({
    file: fs.readFileSync(req.file.path),
    fileName: DateTime.now().toFormat('yyyy-MM-dd') + "__" + nanoid(4) + "__" + req.file.originalname,
    folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/SubCategories/${customId}`
  })

  const subCategory = {
    name,
    slug,
    Image: {
      fileUrl: url,
      filePath
    },
    customId,
    categoryId
  }

  const newSubCategory = await SubCategory.create(subCategory);

  res.status(201).json({ message: "Sub category added successfully", data: newSubCategory })

}

export const getSubCategory = async (req, res, next) => {
  const { id, name, slug } = req.query;

  const queryFilter = {};

  if (id) queryFilter.id = id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;

  const subCategory = await SubCategory.findOne(queryFilter);

  if (!subCategory) {
    return next(new ErrorHandlerClass("Sub category not found", 404));
  }

  res.status(200).json({ message: "done", data: subCategory });
}

export const updateSubCategory = async (req, res, next) => {
  const { _id } = req.params;
  const { name } = req.body;

  const subCategory = await SubCategory.findById(_id).populate('categoryId', 'customId');



  if (!subCategory) {
    return next(new ErrorHandlerClass("Sub category not found", 404));
  }


  if (name) {
    const slug = slugify(name, {
      lower: true,
      replacement: '_'
    })

    subCategory.name = name;
    subCategory.slug = slug;

  }

  if (req.file) {
    const splitedFilePath = subCategory.Image.filePath.split(`${subCategory.customId}/`)[1];




    const { url } = await imageKitConfig().upload({
      file: fs.readFileSync(req.file.path),
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`,
      fileName: splitedFilePath,
      useUniqueFileName: false
    })

    subCategory.Image.fileUrl = url;
  }

  await subCategory.save();

  res.status(200).json({ message: "Sub category updated successfully", data: subCategory })

}

export const deleteSubCategory = async (req, res, next) => {
  const { _id } = req.params;

  const subCategory = await SubCategory.findByIdAndDelete(_id).populate("categoryId");

  if (!subCategory) {
    return next(new ErrorHandlerClass("Sub category not found", 404));
  }

  const subCategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`

  await imageKitConfig().deleteFolder(subCategoryPath);

  const deletedBrands = await Brand.deleteMany({ subCategoryId: _id });

  // delete related brands

  return res.status(200).json({ message: "Sub category has been deleted successfully" });
}

export const listSubCategories = async (req, res, next) => {

  const ApiFeaturesInstance = new ApiFeatures(SubCategory.find(), req.query).pagination().filter().fields().sort().search();

  const subCategories = await ApiFeaturesInstance.mongooseQuery;

  res.status(200).json({ message: "done", data: subCategories });
}

