import express, { Router } from 'express';
import {
  login,
  refreshToken,
  register,
  resetUserPassword,
  userForgotPassword,
  verifyForgotPasswordOtp,
  createConnectStripeLink,
  verifyUser,
  getUser,
  registerSeller,
  verifySeller,
  createShop,
  getSeller,
  sellerLogin,
  sellerForgotPassword,
  resetSellerPassword,
  updateUserPassword,
  addUserAddress,
  deleteUserAddress,
  getUserAddresses,
  userLogout
} from '../controllers/auth.controller';
import { isAuthenticated, isSeller } from '@ecommerce/middleware';
const authRouter: Router = express.Router();

authRouter.post('/user-registration', register);
authRouter.post('/verify-user', verifyUser);
authRouter.post('/login-user', login);
authRouter.post('/logout-user', userLogout);

authRouter.post('/forgot-password-user', userForgotPassword);
authRouter.post('/reset-password-user', resetUserPassword);
authRouter.post('/verify-forgot-password-user', verifyForgotPasswordOtp);
authRouter.post('/refresh-token', refreshToken);
authRouter.get('/logged-in-user', isAuthenticated, getUser);
authRouter.post('/seller-registration', registerSeller);
authRouter.post('/verify-seller', verifySeller);
authRouter.post('/create-shop', createShop);
authRouter.post('/login-seller', sellerLogin);
authRouter.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
authRouter.post('/create-connect-account-link', createConnectStripeLink);

authRouter.post('/forgot-password-seller', sellerForgotPassword);
authRouter.post('/reset-password-seller', resetSellerPassword);
authRouter.patch('/update-user-password', isAuthenticated, updateUserPassword);
authRouter.post('/add-address', isAuthenticated, addUserAddress);
authRouter.delete('/delete-address/:addressId', isAuthenticated, deleteUserAddress);
authRouter.get('/get-addresses', isAuthenticated, getUserAddresses);
export default authRouter;
