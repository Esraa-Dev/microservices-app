import express, { Router } from 'express';
import { loginUser, register, resetUserPassword, userForgotPassword, verifyForgotPasswordOtp, verifyUser } from '../controllers/auth.controller';
const authRouter:Router = express.Router();

authRouter.post('/user-registration', register);
authRouter.post('/verify-user', verifyUser);
authRouter.post('/login-user', loginUser);
authRouter.post('/forgot-password-user', userForgotPassword);
authRouter.post('/reset-password-user', resetUserPassword);
authRouter.post('/verify-forgot-password-user', verifyForgotPasswordOtp);

export default authRouter;
