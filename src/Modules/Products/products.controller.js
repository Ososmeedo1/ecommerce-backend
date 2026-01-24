// models
import { Category, Product } from "../../../DB/Models/index.js";
// utils
import { calculateProductPrice, ErrorHandlerClass, imageKitConfig } from "../../Utils/index.js";
import { uploadFile } from "../../Utils/index.js";
// built-in module
import fs from 'fs';
// third party module
import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import slugify from "slugify";
import { ApiFeatures } from "../../Utils/index.js";

/**
 * @api {post} /products/add Add Product
 */

export const addProduct = async (req, res, next) => {
  // destructing the request body

  const { title, overview, specs, price, discountAmount, discountType, stock } = req.body;

  // Ids from req.query



  if (!req.files.length) {
    return next(new ErrorHandlerClass("No images were uploaded", 400))
  }

  // Checking Ids

  const brandDocument = req.document;

  // Images

  const customId = nanoid(4);
  const brandCustomId = brandDocument.customId;
  const categoryCustomId = brandDocument.categoryId.customId;
  const subCategoryCustomId = brandDocument.subCategoryId.customId;
  const folder = `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`
  const URLs = [];

  for (const file of req.files) {
    // upload each file

    const { url, filePath } = await uploadFile({
      file: fs.readFileSync(file.path),
      folder,
      fileName: DateTime.now().toFormat('yyyy-MM-dd') + '__' + nanoid(4) + file.originalname
    });

    URLs.push({ fileUrl: url, filePath });
  }

  // product object

  const productInfo = {
    title,
    overview,
    specs: JSON.parse(specs),
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType
    },
    stock,
    Images: {
      URLs,
      customId
    },
    categoryId: brandDocument.categoryId._id,
    subCategoryId: brandDocument.subCategoryId._id,
    brandId: brandDocument._id,
  }

  const newProduct = await Product.create(productInfo);

  return res.status(201).json({ message: "Product was added successfully", data: newProduct });

}

/**
 * @api {put} /products/update/:productId Update product
 */

export const updateProduct = async (req, res, next) => {
  // productId from params
  const { productId } = req.params;

  // destructing the request body
  const { title, stock, overview, badges, price, discountAmount, discountType, specs } = req.body;

  // search for product
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandlerClass("Product not found", 404))
  }

  if (title) {
    product.title = title;
    product.slug = slugify(title, {
      lower: true,
      replacement: "_"
    })
  };

  if (stock) product.stock = stock;
  if (overview) product.overview = overview;
  if (badges) product.badges = badges;

  if (price || discountAmount || discountType) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;

    product.appliedPrice = calculateProductPrice(newPrice, discount)

    product.price = newPrice;
    product.appliedDiscount = discount;
  }

  if (specs) product.specs = specs;

  await product.save();

  return res.status(200).json({ message: "Product has been updated successfully", data: product });


}

/**
 * @api {get} /products/list list all products
 */

export const listProducts = async (req, res, next) => {


  const ApiFeaturesInstance = new ApiFeatures(Product.find(), req.query).pagination().filter().fields().sort().search()

  const products = await ApiFeaturesInstance.mongooseQuery;

  if (products.length === 0) {
    return res.status(200).json({ message: "Products doesn't exist", data: [] })
  }

  const page = ApiFeaturesInstance.pageNumber;
  const total = await ApiFeaturesInstance.getCount();

  return res.status(200).json({ message: "done", page, total, data: products })
}

/**
 * @api {get} /products/:_id get product by id
 */

export const getSpecificProduct = async (req, res, next) => {
  const { _id } = req.params;

  const product = await Product.findById({ _id }).populate([{ path: 'categoryId' }, { path: "subCategoryId" }, { path: "brandId" }]);

  if (!product) {
    return next(new ErrorHandlerClass("Product not exists", 404));
  }

  return res.status(200).json({ message: "done", data: product });
}

/**
 * @api {delete} /products/:_id delete product
 */

export const deleteProduct = async (req, res, next) => {
  const { _id } = req.params;

  const product = await Product.findByIdAndDelete(_id).populate([{ path: "categoryId", select: "customId -_id" }, { path: "subCategoryId", select: 'customId -_id' }, { path: "brandId", select: 'customId -_id' }]);

  if (!product) {
    return next(new ErrorHandlerClass("Product not exists", 404));
  }

  const productPath = `${process.env.UPLOADS_FOLDER}/Categories/${product.categoryId.customId}/SubCategories/${product.subCategoryId.customId}/Brands/${product.brandId.customId}/Products/${product.Images.customId}`;

  await imageKitConfig().deleteFolder(productPath);

  return res.status(200).json({ message: "Product has been deleted successfully" });
}

