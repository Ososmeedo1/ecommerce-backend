
import { compareSync } from "bcryptjs";
import { Address, User } from "../../../DB/Models/index.js";
import { ErrorHandlerClass } from "../../Utils/index.js";
import jwt from 'jsonwebtoken'
/**
 * @api {POST} /users/register Register a new user
 */


export const register = async (req, res, next) => {
  const { username, email, password, gender, age, phone, userType, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;

  // checking email

  const user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandlerClass("Email already exists", 400));
  }

  // new user instance

  const userInfo = new User({
    username,
    email,
    password,
    age,
    gender,
    phone,
    userType
  })
  

  // new address instance

  const addressInfo = new Address({ country, city, postalCode, buildingNumber, floorNumber, addressLabel, isDefault: true, userId: userInfo._id })

  // send email verification link

  const newUser = await userInfo.save();
  const newAddress = await addressInfo.save();

  const userResponse = newUser.toObject();

  delete userResponse.password;


  return res.status(201).json({ message: "registeration has been done successfully", data: { userResponse, newAddress } })
}

export const login = async (req, res, next) => {
  // destructing email and password

  const { email, password } = req.body;

  // Check user

  const user = await User.findOne({ email });

  if (!user) {
    return next(ErrorHandlerClass("Invalid Credentials", 400));
  }

  // check password

  const matchPassword = compareSync(password, user.password);

  if (!matchPassword) {
    return next(new ErrorHandlerClass("Invalid Credentials", 400));
  }

  const token = jwt.sign({ id: user._id }, process.env.CONFIRMATION_SECRET);

  return res.status(200).json({ message: "Logged in successfully", data: token });
}

export const confirmEmail = async (req, res, n) => {
  // destructing user _id
  const { user } = req.user;

  const userUpdate = await User.findByIdAndUpdate(user._id, { isConfirmed: true }, { new: true });

  //return response

  return res.status(200).json({ message: "Email confirmed" });
}

export const updateAccount = async (req, res, next) => {
  const { userId } = req.params;
  const { password, username } = req.body;

  // search user

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandlerClass("User not exists", 404));
  }

  if (password) {
    user.password = password;
  }

  if (username) {
    user.username = username;
  }

  await user.save();

  return res.status(200).json({ message: "password has been changed" });
}