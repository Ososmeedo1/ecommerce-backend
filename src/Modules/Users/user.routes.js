import { Router } from "express";
import { auth, errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as userController from './user.controller.js';
import * as userSchema from './user.schema.js'

const userRouter = Router();

userRouter.post('/register', validationMiddleware(userSchema.register), errorHandle(userController.register))
userRouter.post('/login', validationMiddleware(userSchema.login), errorHandle(userController.login))
userRouter.put('/update', auth(), validationMiddleware(userSchema.updateAccount), errorHandle(userController.updateAccount))
userRouter.delete('/delete', auth(), validationMiddleware(userSchema.userAccount), errorHandle(userController.deleteAccount))
userRouter.get('/profile', auth(), validationMiddleware(userSchema.userAccount), errorHandle(userController.getUserProfile))

export { userRouter };