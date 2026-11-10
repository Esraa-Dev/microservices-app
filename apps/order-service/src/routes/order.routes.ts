import express, { Router } from "express";
import { isAuthenticated, isSeller } from '@ecommerce/middleware';
import { 
  createPaymentIntent, 
  createPaymentSession, 
  verifyPaymentSession ,
  getSellerOrder,
  getOrderDetails
} from '../controllers/order.controller';

const router: Router = express.Router();

router.post('/create-payment-intent',isAuthenticated, createPaymentIntent);

router.post('/create-payment-session',isAuthenticated, createPaymentSession);

router.get('/verify-payment-session',isAuthenticated, verifyPaymentSession);
router.get('/get-seller-orders',isAuthenticated,isSeller, getSellerOrder);
router.get('/get-order-details/:id',isAuthenticated,isSeller, getOrderDetails);

export default router;