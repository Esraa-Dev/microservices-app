import express, { Router } from 'express';
import { register, verifyUser } from '../controllers/auth.controller';
const authRouter:Router = express.Router();

authRouter.post('/register', register);
authRouter.post('/verify-user', verifyUser);

export default authRouter;
