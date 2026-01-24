import { Address } from "../../../DB/Models/index.js";
import { ErrorHandlerClass } from "../../Utils/index.js";



/**
 * 
 * @api {post} /addresses/add add new address
 */


export const addAddress = async (req, res, next) => {
  const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setAsDefault } = req.body;

  const userId = req.user._id;

  const newAddress = new Address({ userId, country, city, postalCode, buildingNumber, floorNumber, addressLabel, isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false })

  // if the new address is default so change the old address to be not default

  if (newAddress.isDefault) {
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
  }

  await newAddress.save();

  return res.status(201).json({ message: "Address was added", data: newAddress })
}

/**
 * 
 * @api {put} /addresses/update/:addressId add new address
 */

export const updateAddress = async (req, res, next) => {
  const { country, city, postalCode, buildingNumber, floorNumber, addressLabel, setAsDefault } = req.body;
  const userId = req.user;
  const { addressId } = req.params;

  const address = await Address.findOne({ _id: addressId, userId, isMarkedAsDeleted: false })

  if (!address) {
    return next(new ErrorHandlerClass("Address not found", 404));
  }


  if (country) address.country = country;
  if (city) address.city = city;
  if (postalCode) address.postalCode = postalCode;
  if (buildingNumber) address.buildingNumber = buildingNumber;
  if (floorNumber) address.floorNumber = floorNumber;
  if (addressLabel) address.addressLabel = addressLabel;
  if ([true, false].includes(setAsDefault)) {
    address.isDefault = [true, false].includes(setAsDefault) ? setAsDefault : false;
    await Address.updateOne({ isDefault: true, userId }, { isDefault: false });
  }


  await address.save();

  return res.status(200).json({ message: "Address was updated successfully" });
}

/**
 * 
 * @api {patch} /addresses/soft-delete/:addressId soft delete for address
 */

export const deleteAddress = async (req, res, next) => {
  const userId = req.user;
  const { addressId } = req.params;

  const address = await Address.findOneAndUpdate({ _id: addressId, userId, isMarkedAsDeleted: false }, { isMarkedAsDeleted: true, isDefault: false }, { new: true });

  if (!address) {
    return next(new ErrorHandlerClass("Address not found", 404));
  }

  return res.status(200).json({ message: "Address has been deleted" });
}

/**
 * 
 * @api {get} /addresses get all addresses
 */

export const getAllAddresses = async (req, res, next) => {
  const userId = req.user;
  
  const addresses = await Address.find({userId, isMarkedAsDeleted: false});
  

  if (!addresses.length) {
    return next(new ErrorHandlerClass("No addresses", 404));
  }

  return res.status(200).json({message: "done", data: addresses})
}