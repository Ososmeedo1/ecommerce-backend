
import { ErrorHandlerClass } from "../../Utils/index.js";
import { Category, Product } from "./../../../DB/Models/index.js";
import fs from 'fs';
import slugify from "slugify";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { imageKitConfig } from "../../Utils/index.js";
import { ApiFeatures } from "../../Utils/index.js";


export const addCategory = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user._id;

  // Search category by name

  const searchCategory = await Category.findOne({ name });

  if (searchCategory) {
    return next(new ErrorHandlerClass("Name already exists", 400));
  }

  // Image

  if (!req.file) {
    return next(new ErrorHandlerClass("Picture is required", 400));
  }


  // upload the image to imagekit

  const customId = nanoid(4)

  const { url, filePath } = await imageKitConfig().upload({
    file: fs.readFileSync(req.file.path),
    fileName: DateTime.now().toFormat('yyyy-MM-dd') + '__' + nanoid(4) + '__' + req.file.originalname,
    folder: `${process.env.UPLOADS_FOLDER}/Categories/${customId}`
  })



  // category object

  const category = {
    name,
    Image: {
      fileUrl: url,
      filePath
    },
    customId,
    addedBy: userId
  }

  // Add category to database



  const newCategory = await Category.create(category);

  // response


  res.status(201).json({ message: "Category added successfully", data: newCategory });
}

export const getCategory = async (req, res, next) => {
  const { id, name, slug } = req.query;

  // Searching filter

  const queryFilter = {};

  if (id) queryFilter._id = id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;

  // Checking if no searching info

  if (Object.keys(queryFilter).length == 0) {
    return next(new ErrorHandlerClass("Category was not defined", 400))
  }

  const category = await Category.findOne(queryFilter);

  if (!category) {
    return next(new ErrorHandlerClass("Category not found", 404));
  }

  // response

  res.status(200).json({ message: "done", data: category });
}

export const updateCategory = async (req, res, next) => {
  const { _id } = req.params;

  const category = await Category.findById(_id);

  if (!category) {
    return next(new ErrorHandlerClass("Category not found", 404));
  }


  const { name } = req.body;

  if (name) {
    const searchCategory = await Category.findOne({ name });
    if (searchCategory) {
      return next(new ErrorHandlerClass("this category name already exists", 400));
    }
    
    const slug = slugify(name, {
      replacement: '_',
      lower: true
    })

    category.name = name;
    category.slug = slug;


  }

  if (req.file) {

    const splitedFilePath = category.Image.filePath.split(`${category.customId}/`)[1];

    await imageKitConfig().upload({
      file: fs.readFileSync(req.file.path),
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
      fileName: splitedFilePath,
      useUniqueFileName: false
    }).then((response) => {
      category.Image.fileUrl = response.url;
    })


  }

  await category.save();

  return res.status(200).json({ message: "done", data: category });
}

export const deleteCategory = async (req, res, next) => {

  const { _id } = req.params;

  const category = await Category.findByIdAndDelete(_id);


  if (!category) {
    return next(new ErrorHandlerClass("Category not found", 404));
  }

  const data = await imageKitConfig().deleteFolder(`${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`);



  return res.status(200).json({ message: "category deleted successfully" })

}

export const listCategories = async (req, res, next) => {

  const ApiFeaturesInstance = new ApiFeatures(Category.find(), req.query).pagination().filter().fields().sort().search();

  const categories = await ApiFeaturesInstance.mongooseQuery;

  res.status(200).json({ message: "done", page: ApiFeaturesInstance.pageNumber, categories });
}