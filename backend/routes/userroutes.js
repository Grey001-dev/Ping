import express from 'express'
import {getUser,updateNotificationEmail} from '../controller/userController.js'
import {verifyToken} from '../middleware/auth.js';
const userRouter=express.Router()

userRouter.get('/me',verifyToken,getUser)
userRouter.patch('/notification-email',verifyToken,updateNotificationEmail)

export default userRouter;