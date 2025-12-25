import { Router } from "express";
import { errorHandle, validationMiddleware } from "../../Middlewares/index.js";
import * as userController from './user.controller.js';
import * as userSchema from './user.schema.js'

const userRouter = Router();

userRouter.post('/register', validationMiddleware(userSchema.register), errorHandle(userController.register))
userRouter.post('/login', errorHandle(userController.login))
userRouter.patch('/password/:userId', errorHandle(userController.updateAccount))

export { userRouter };