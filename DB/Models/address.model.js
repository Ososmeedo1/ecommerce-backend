import mongoose from "mongoose";


const { Schema, models, model, Types } = mongoose;

const addressSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    country: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: Number,
      required: true
    },
    buildingNumber: {
      type: String,
      required: true
    },
    floorNumber: {
      type: Number,
      required: true
    },
    addressLabel: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true });

  export const Address = models.Address || model('Address', addressSchema);