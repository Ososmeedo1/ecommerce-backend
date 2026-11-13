import { User } from "../../DB/Models/index.js";
import { ErrorHandlerClass } from "../Utils/index.js";
import jwt from 'jsonwebtoken';

export const auth = (roles = ['Buyer', "Admin"]) => {
  return async (req, res, next) => {
    // get token
    const {token} = req.headers;

    // check token

    if (!token) {
      return next(new ErrorHandlerClass("Not logged in", 400));
    }

    if (!token.startsWith) {
      return next(new ErrorHandlerClass("Invalid bearer key"))
    }

    // Decoding token

    const originalToken = token.split(process.env.BEARER_KEY)[1];
    const decodedToken = jwt.verify(originalToken, process.env.CONFIRMATION_SECRET);
    

    if (!decodedToken.id) {
      return next(new ErrorHandlerClass("Invalid payload", 400))
    }

    // check user

    const user = await User.findById(decodedToken.id).select('-password +passwordChangedAt');

    if (!user) {
      return next(new ErrorHandlerClass("User not found", 404));
    }

    // Password reset/change invalidates every JWT issued before the change.
    // Tokens carry the password version (`pwd`, in milliseconds) that was
    // current when they were signed. Older tokens have no claim (`0`), so
    // sessions created before this feature keep working until the next
    // password change.
    if (user.passwordChangedAt) {
      const tokenPasswordVersion = decodedToken.pwd ?? 0;
      if (tokenPasswordVersion < user.passwordChangedAt.getTime()) {
        return next(new ErrorHandlerClass("Session expired. Please log in again.", 401));
      }
    }

    // check authorization
    
    if (!roles.includes(user.userType)) {
      return next(new ErrorHandlerClass("User not authorized", 401));
    }

    // return user

    req.user = user;
    return next();
  }
}