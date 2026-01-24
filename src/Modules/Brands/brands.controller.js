import slugify from "slugify";
import { SubCategory, Brand } from "./../../../DB/Models/index.js";
import { imageKitConfig, ErrorHandlerClass } from "../../Utils/index.js";
import { nanoid } from "nanoid";
import fs from 'fs'
import { DateTime } from "luxon";


export const addBrand = async (req, res, next) => {

  const { category, subCategory } = req.query;
  const { name } = req.body;

  // Search subCategory if exists

  const searchBrand = await Brand.findOne({ name });

  if (searchBrand) {
    return next(new ErrorHandlerClass("this brand name already exists", 400));
  }

  const searchSubCategory = await SubCategory.findOne({ _id: subCategory, categoryId: category }).populate('categoryId');

  if (!searchSubCategory) {
    return next(new ErrorHandlerClass("SubCategory not found", 404));
  }

  const slug = slugify(name, {
    lower: true,
    replacement: '-'
  })

  if (!req.file) {
    return next(new ErrorHandlerClass("Image is required", 400));
  }

  const customId = nanoid(4);

  const { url, filePath } = await imageKitConfig().upload({
    folder: `${process.env.UPLOADS_FOLDER}/Categories/${searchSubCategory.categoryId.customId}/SubCategories/${searchSubCategory.customId}/Brands/${customId}`,
    file: fs.readFileSync(req.file.path),
    fileName: DateTime.now().toFormat('yyyy-MM-dd') + '__' + nanoid(4) + '__' + req.file.originalname
  })

  const brandInfo = {
    name,
    slug,
    customId,
    logo: {
      fileUrl: url,
      filePath
    },
    categoryId: searchSubCategory.categoryId._id,
    subCategoryId: searchSubCategory._id
  }


  const brand = await Brand.create(brandInfo);

  return res.status(201).json({ message: "done", data: brand });


}

export const getBrand = async (req, res, next) => {
  const { id, name, slug } = req.query;

  const queryFilter = {};

  if (id) queryFilter._id = id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;

  const brand = await Brand.findOne(queryFilter);

  if (!brand) {
    return next(new ErrorHandlerClass("Brand not found", 404));
  }

  return res.status(200).json({ message: "done", data: brand });

}

export const updateBrand = async (req, res, next) => {
  const { _id } = req.params;
  const { name } = req.body;

  const brand = await Brand.findById(_id).populate([{ path: 'categoryId' }, { path: 'subCategoryId' }]);

  if (name) {

    const slug = slugify(name, {
      lower: true,
      replacement: "-"
    })

    brand.name = name;
    brand.slug = slug;
  }

  if (req.file) {

    const splitedFilePath = brand.logo.filePath.split(`${brand.customId}/`)[1];


    const { url } = await imageKitConfig().upload({
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`,
      fileName: splitedFilePath,
      file: fs.readFileSync(req.file.path),
      useUniqueFileName: false
    })

    brand.logo.fileUrl = url;
  }

  await brand.save();

  return res.json({ message: "Brand has been updated successfully", data: brand });
}

export const deleteBrand = async (req, res, next) => {
  const { _id } = req.params;

  const brand = await Brand.findByIdAndDelete(_id).populate([{ path: "categoryId" }, { path: "subCategoryId" }]);

  if (!brand) {
    return next(new ErrorHandlerClass("Brand not exists", 404));
  }

  const brandPath = `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`

  await imageKitConfig().deleteFolder(brandPath)

  // delete related products

  return res.status(200).json({ message: "Brand has been deleted successfully" });
}