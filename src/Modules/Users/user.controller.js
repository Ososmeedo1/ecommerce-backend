import { compareSync, hashSync } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { customAlphabet } from "nanoid";
import jwt from "jsonwebtoken";
import { Address, User } from "../../../DB/Models/index.js";
import { ErrorHandlerClass } from "../../Utils/index.js";
import { sendEmailService } from "../../Services/sendEmail.service.js";

// Password-reset policy. OTPs are short lived, high entropy, stored as bcrypt
// hashes and delivered only by email. Reset tokens are 256-bit random values
// stored as SHA-256 hashes (they are high entropy, so a fast hash is enough).
const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const OTP_EXPIRY_MINUTES = OTP_TTL_MS / 60000;
const OTP_LENGTH = 6;
// Ambiguous characters (0/O, 1/I) removed so codes are easy to retype.
const generateOtp = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", OTP_LENGTH);
const generateResetToken = () => randomBytes(32).toString("hex");
const hashResetToken = (token) => createHash("sha256").update(String(token)).digest("hex");
const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();
const normalizeOtp = (otp) => String(otp ?? "").trim().toUpperCase();

const getSaltRounds = () => {
  const rounds = Number(process.env.SALT_ROUNDS);
  return Number.isInteger(rounds) && rounds > 0 ? rounds : 10;
};

// Callers must select the reset fields explicitly (`+passwordReset...`) before
// using this; otherwise Mongoose would not persist the cleared values.
const clearPasswordResetState = (user) => {
  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpiresAt = null;
  user.passwordResetOtpTokenHash = null;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
};

// Fields that must be selected explicitly because the model marks them
// `select: false`. Kept in one place so the controllers stay readable.
const PASSWORD_RESET_SELECT =
  "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpTokenHash " +
  "+passwordResetTokenHash +passwordResetTokenExpiresAt";

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

  // Check user. `passwordChangedAt` is `select: false`, so opt in explicitly
  // to embed the current password version in the token.

  const user = await User.findOne({ email }).select("+passwordChangedAt");

  if (!user) {
    return next(new ErrorHandlerClass("Invalid Credentials", 400));
  }

  // check password

  const matchPassword = compareSync(password, user.password);

  if (!matchPassword) {
    return next(new ErrorHandlerClass("Invalid Credentials", 400));
  }

  // `pwd` is the millisecond timestamp of the last password change. The auth
  // middleware rejects tokens whose `pwd` is older than the stored value.
  const token = jwt.sign(
    { id: user._id, pwd: user.passwordChangedAt?.getTime() || 0 },
    process.env.CONFIRMATION_SECRET
  );

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

  // Password + reset fields are `select: false`; opt in because a password
  // change must verify the current password and invalidate pending resets.
  const user = await User.findById(userId).select(
    `+password +passwordChangedAt ${PASSWORD_RESET_SELECT}`
  );

  if (!user) {
    return next(new ErrorHandlerClass("User not exists", 404));
  }

  const { password, currentPassword, username, email, age, phone, userType, gender, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;

  if (password) {
    if (!currentPassword) {
      return next(new ErrorHandlerClass("Current password is required to change your password", 400));
    }
    if (!compareSync(currentPassword, user.password)) {
      return next(new ErrorHandlerClass("Current password is incorrect", 400));
    }
    if (compareSync(password, user.password)) {
      return next(new ErrorHandlerClass("New password must be different from the current password", 400));
    }

    user.password = password;
    // JWTs issued before this instant stop working (see auth middleware).
    user.passwordChangedAt = new Date();
    // A password change also invalidates any pending reset flow.
    clearPasswordResetState(user);
  }

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

/**
 * @api {patch} /users/forgot-password Start the password-reset flow
 */
export const forgotPassword = async (req, res, next) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandlerClass("User not exists", 404));
  }

  const otp = generateOtp();
  const otpToken = generateResetToken();

  // Replace any previous OTP and invalidate any reset token from an older
  // attempt. `updateOne` is used because the reset fields are not selected on
  // the user document.
  const updateResult = await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetOtpHash: hashSync(otp, getSaltRounds()),
        passwordResetOtpTokenHash: hashResetToken(otpToken),
        passwordResetOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
      $unset: {
        passwordResetTokenHash: "",
        passwordResetTokenExpiresAt: "",
      },
    }
  );

  if (!updateResult.matchedCount) {
    return next(new ErrorHandlerClass("User not exists", 404));
  }

  try {
    // Awaited on purpose: the API must not report success when SMTP failed.
    await sendEmailService({
      to: user.email,
      name: user.username,
      subject: "Your Masar password reset code",
      message: otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch {
    // The OTP was persisted before sending. Remove it so a failed delivery
    // cannot leave a usable code behind.
    await User.updateOne(
      { _id: user._id },
      {
        $unset: {
          passwordResetOtpHash: "",
          passwordResetOtpTokenHash: "",
          passwordResetOtpExpiresAt: "",
        },
      }
    ).catch(() => {});

    return next(
      new ErrorHandlerClass(
        "Could not send the password reset email. Please try again later.",
        502
      )
    );
  }

  return res.status(200).json({
    message: "Password reset code has been sent to your email successfully",
    data: otpToken,
  });
};

/**
 * @api {post} /users/verify-otp Verify the emailed password-reset code
 */
export const verifyOtp = async (req, res, next) => {
  const otpToken = req.body.otpToken || req.body.token;
  const otp = normalizeOtp(req.body.otp);

  if (!otpToken) {
    return next(new ErrorHandlerClass("Invalid or expired verification code", 400));
  }

  const otpTokenHash = hashResetToken(otpToken);
  const user = await User.findOne({
    passwordResetOtpTokenHash: otpTokenHash,
    passwordResetOtpExpiresAt: { $gt: new Date() },
  }).select("+passwordResetOtpHash");

  if (!user || !user.passwordResetOtpHash) {
    return next(new ErrorHandlerClass("Invalid or expired verification code", 400));
  }

  if (!compareSync(otp, user.passwordResetOtpHash)) {
    return next(new ErrorHandlerClass("Invalid or expired verification code", 400));
  }

  const resetToken = generateResetToken();

  // Atomic consume: the same OTP token cannot be verified twice, even when
  // two requests race. Replacing the OTP fields also invalidates the code.
  const consumed = await User.findOneAndUpdate(
    {
      _id: user._id,
      passwordResetOtpTokenHash: otpTokenHash,
      passwordResetOtpHash: user.passwordResetOtpHash,
      passwordResetOtpExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        passwordResetTokenHash: hashResetToken(resetToken),
        passwordResetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
      $unset: {
        passwordResetOtpHash: "",
        passwordResetOtpTokenHash: "",
        passwordResetOtpExpiresAt: "",
      },
    },
    { new: true }
  );

  if (!consumed) {
    return next(new ErrorHandlerClass("Invalid or expired verification code", 400));
  }

  return res.status(200).json({
    message: "OTP verified successfully",
    data: resetToken,
  });
};

/**
 * @api {post} /users/reset-password Set a new password with a reset token
 */
export const resetPassword = async (req, res, next) => {
  const resetToken = String(req.body.resetToken ?? "").trim();
  const newPassword = req.body.newPassword;
  const resetTokenHash = hashResetToken(resetToken);

  const user = await User.findOne({
    passwordResetTokenHash: resetTokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    return next(new ErrorHandlerClass("Invalid or expired reset token", 400));
  }

  if (compareSync(newPassword, user.password)) {
    return next(
      new ErrorHandlerClass(
        "New password must be different from the current password",
        400
      )
    );
  }

  // The token hash is part of the update filter, so the same reset token can
  // only ever be consumed once, even under concurrent requests. The password
  // is hashed with the same bcryptjs mechanism as the User model pre-save hook.
  const updated = await User.findOneAndUpdate(
    {
      _id: user._id,
      passwordResetTokenHash: resetTokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        password: hashSync(newPassword, getSaltRounds()),
        // Invalidate JWTs issued before this password change.
        passwordChangedAt: new Date(),
      },
      $unset: {
        passwordResetOtpHash: "",
        passwordResetOtpExpiresAt: "",
        passwordResetOtpTokenHash: "",
        passwordResetTokenHash: "",
        passwordResetTokenExpiresAt: "",
      },
    },
    { new: true }
  );

  if (!updated) {
    return next(new ErrorHandlerClass("Invalid or expired reset token", 400));
  }

  return res.status(200).json({ message: "Password has been reset successfully" });
};

/**
 * @api {put} /users/change-password Change a password while logged in
 */
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select(
    `+password +passwordChangedAt ${PASSWORD_RESET_SELECT}`
  );

  if (!user) {
    return next(new ErrorHandlerClass("User not exists", 404));
  }

  if (!compareSync(currentPassword, user.password)) {
    return next(new ErrorHandlerClass("Current password is incorrect", 400));
  }

  if (compareSync(newPassword, user.password)) {
    return next(
      new ErrorHandlerClass(
        "New password must be different from the current password",
        400
      )
    );
  }

  user.password = newPassword;
  // Existing JWTs (including the caller's) stop working after this save.
  user.passwordChangedAt = new Date();
  clearPasswordResetState(user);
  await user.save();

  return res.status(200).json({
    message: "Password has been changed successfully. Please log in again.",
  });
};
