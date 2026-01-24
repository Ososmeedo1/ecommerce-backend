import { Router } from "express";
import * as addressController from './address.controller.js'
import * as addressSchema from './address.schema.js'
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";


const addressRouter = Router();

addressRouter.post('/add', auth(), validationMiddleware(addressSchema.addAddress), errorHandle(addressController.addAddress));
addressRouter.put('/update/:addressId', auth(), validationMiddleware(addressSchema.updateAddress), errorHandle(addressController.updateAddress));
addressRouter.patch('/soft-delete/:addressId', auth(), validationMiddleware(addressSchema.deleteAddress), errorHandle(addressController.deleteAddress));
addressRouter.get('/', auth(), validationMiddleware(addressSchema.getAllAddresses), errorHandle(addressController.getAllAddresses));

export { addressRouter };