
import { compareSync } from "bcryptjs";
import { Address, User } from "../../../DB/Models/index.js";
import { ErrorHandlerClass } from "../../Utils/index.js";
import jwt from 'jsonwebtoken'
/**
 * @api {POST} /users/register Register a new user
 */

export const register = async (req, res, next) => {
  const { username, email, password, gender, age, phone, userType, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;

  // checking username and email in one query

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (user) {
    if (user.username === username) {
      return next(new ErrorHandlerClass("Username already exists", 400));
    }
    if (user.email === email) {
      return next(new ErrorHandlerClass("Email already exists", 400));
    }
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
    return next(new ErrorHandlerClass("Invalid Credentials", 400));
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

  const userUpdate = await User.findByIdAndUpdate(user._id, { isEmailVerified: true }, { new: true });

  //return response

  return res.status(200).json({ message: "Email confirmed" });
}

export const updateAccount = async (req, res, next) => {
  const userId = req.user._id;

  // search user

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandlerClass("User not exists", 404));
  }

  const { password, username, email, age, phone, userType, gender, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;

  if (password) user.password = password;

  if (age) user.age = age;
  if (phone) user.phone = phone;
  if (userType) user.userType = userType;
  if (gender) user.gender = gender;

  if (country || city || postalCode || buildingNumber || floorNumber || addressLabel) {
    const address = await Address.findOne({ userId: user._id, isDefault: true });
    if (country) address.country = country;
    if (city) address.city = city;
    if (postalCode) address.postalCode = postalCode;
    if (buildingNumber) address.buildingNumber = buildingNumber;
    if (floorNumber) address.floorNumber = floorNumber;
    if (addressLabel) address.addressLabel = addressLabel;
    await address.save();
  }

  if (username) {
    const checkUserName = await User.findOne({ username });

    if (checkUserName) {
      return next(new ErrorHandlerClass("Username already exists", 400));
    }

    user.username = username;
  }

  if (email) {
    const checkEmail = await User.findOne({ email });

    if (checkEmail) {
      return next(new ErrorHandlerClass("Email already exists", 400));
    }

    user.email = email;
  }

  await user.save();

  return res.status(200).json({ message: "data has been updated" });
}

export const deleteAccount = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new ErrorHandlerClass("User does not exist", 404));
  }

  res.status(200).json({ message: "User account has been deleted successfully" });
}

export const getUserProfile = async (req, res, next) => {
  const userId = req.user._id;



  const user = await User.findById(userId).select('-password');

  if (!user) {
    return next(new ErrorHandlerClass("User does not exist", 404));
  }

  const userInfo = {};

  userInfo.user = user;

  const address = await Address.findOne({ userId: user._id });

  userInfo.address = address;

  res.status(200).json({ message: "done", data: userInfo });
}