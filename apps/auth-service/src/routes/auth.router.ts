import express, { Router } from 'express';
import { register } from '../controllers/auth.controller';
const authRouter:Router = express.Router();

authRouter.post('/register', register);

export default authRouter;
