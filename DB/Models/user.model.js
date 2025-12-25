import { hashSync } from "bcryptjs";
import mongoose from "./../global-setup.js";
import { UserType } from "../../src/Utils/index.js";

const {Schema, model, models, Types} = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    userType: {
      type: String,
      required: true,
      enum: Object.values(UserType)
    },
    age: {
      type: Number,
      required: false
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"]
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false
    }
  }, 
  {
    timestamps: true,
    versionKey: false
  }
)


userSchema.pre("save", function(next) {

  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
  }
  next();
})

export const User = models.User || model("User", userSchema);