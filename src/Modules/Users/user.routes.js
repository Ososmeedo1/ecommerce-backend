import { Router } from "express";
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as userController from './user.controller.js';
import * as userSchema from './user.schema.js'

const userRouter = Router();

userRouter.post('/register', validationMiddleware(userSchema.register), errorHandle(userController.register))
userRouter.post('/login', validationMiddleware(userSchema.login), errorHandle(userController.login))
userRouter.patch('/forgot-password', validationMiddleware(userSchema.forgotPassword), errorHandle(userController.forgotPassword))
userRouter.post('/verify-otp', validationMiddleware(userSchema.verifyOtp), errorHandle(userController.verifyOtp))
userRouter.post('/reset-password', validationMiddleware(userSchema.resetPassword), errorHandle(userController.resetPassword))
userRouter.put('/change-password', auth(), validationMiddleware(userSchema.changePassword), errorHandle(userController.changePassword))
userRouter.put('/update', auth(), validationMiddleware(userSchema.updateAccount), errorHandle(userController.updateAccount))
userRouter.delete('/delete', auth(), validationMiddleware(userSchema.userAccount), errorHandle(userController.deleteAccount))
userRouter.get('/profile', auth(), validationMiddleware(userSchema.userAccount), errorHandle(userController.getUserProfile))

export { userRouter };