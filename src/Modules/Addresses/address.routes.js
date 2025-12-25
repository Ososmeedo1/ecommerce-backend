import { Router } from "express";
import * as addressController from './address.controller.js'
import { auth, errorHandle } from "../../Middlewares/index.js";


const addressRouter = Router();

addressRouter.post('/add', auth(), errorHandle(addressController.addAddress));
addressRouter.put('/update/:addressId', auth(), errorHandle(addressController.updateAddress));
addressRouter.patch('/soft-delete/:addressId', auth(), errorHandle(addressController.deleteAddress));
addressRouter.get('/', auth(), errorHandle(addressController.getAllAddresses));

export { addressRouter };