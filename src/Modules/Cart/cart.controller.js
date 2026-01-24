import { Cart, Product } from "../../../DB/Models/index.js";
import { ErrorHandlerClass } from "../../Utils/index.js";
import { checkProductStock } from "./Utils/cart.utils.js";


/**
 * @api {post} /carts/add/:productId Add to cart
 */


export const addToCart = async (req, res, next) => {
  const userId = req.user;
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await checkProductStock(productId, quantity);

  if (!product) {
    return next(new ErrorHandlerClass("Product not available", 404))
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    const newCart = new Cart({ userId, products: [{ productId: product._id, quantity, price: product.appliedPrice }] });

    await newCart.save();

    return res.status(201).json({ message: "Product has been added to cart", data: newCart })
  }



  const checkProduct = cart.products.find(p => p.productId.toString() == product._id.toString());


  if (checkProduct) {
    return next(new ErrorHandlerClass("Product already exists", 400));
  }

  cart.products.push({ productId: product._id, quantity, price: product.appliedPrice });

  await cart.save()

  return res.status(200).json({ message: "Product has been added to cart", data: cart });


}

/**
 * @api {patch} /carts/remove/:productId Remove from cart
 */

export const removeFromCart = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId, 'products.productId': productId });

  if (!cart) {
    return next(new ErrorHandlerClass("Product not in cart", 404));
  }

  cart.products = cart.products.filter(p => p.productId != productId);

  await cart.save();

  return res.status(200).json({ message: "Product has been removed form cart" });
}

/**
 * @api {patch} /carts/update/:productId update cart
 */

export const updateCart = async (req, res, next) => {
  const userId = req.user;
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ userId, 'products.productId': productId });

  if (!cart) {
    return next(new ErrorHandlerClass("Product not in cart", 404));
  }

  const product = await checkProductStock(productId, quantity);

  if (!product) {
    return next(new ErrorHandlerClass("Product is not available", 404));
  }

  const productIndex = cart.products.findIndex(p => p.productId.toString() == product._id.toString());

  cart.products[productIndex].quantity = quantity;

  await cart.save();

  return res.status(200).json({ message: "Cart has been updated", data: cart });
}

/**
 * @api {get} /carts get cart
 */

export const getCart = async (req, res, next) => {
  const userId = req.user;
  const cart = await Cart.findOne({ userId })

  if (!cart) {
    return next(new ErrorHandlerClass("No cart exists", 404));
  }

  return res.status(200).json({ message: "done", data: cart });
}