import { NextFunction, Request, Response } from 'express';
import prisma from '@ecommerce/prisma';
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import { AuthError, ValidationError } from '@ecommerce/error-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-08-26.dahlia',
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      return next(new ValidationError('User already exists'));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, 'user-activation-mail');

    return res.status(200).json({
      message: 'OTP sent successfully. Please verify your account',
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!email || !name || !password || !otp) {
      return next(new ValidationError('All fields are required'));
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError('user already exists with this email!'));
    }
    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return next(new AuthError("User doesn't exist"));
    }
    if (!user.password) {
      return next(new AuthError('User password is not available'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AuthError('Invalid email or password'));
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleForgotPassword(req, res, next, 'user');
  } catch (error) {
    return next(error);
  }
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;
    console.log('Reset Password Request:', { email, newPassword });
    if (!email || !newPassword) {
      return next(new ValidationError('Email and new password are required!'));
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError('User not found!'));
    }
    if (!user.password) {
      return next(new ValidationError('User password is not available!'));
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return next(
        new ValidationError(
          'New password cannot be the same as the old password!',
        ),
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required!'));
    }
    await verifyOtp(email, otp, next);

    return res.status(200).json({
      message: 'Otp verified.you can now reset your password.',
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userRefreshToken = req.cookies.refresh_token;
    const sellerRefreshToken = req.cookies.seller_refresh_token;

    const token = userRefreshToken || sellerRefreshToken;

    if (!token) {
      throw new ValidationError('Unauthorized! No refresh token.');
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as {
      id: string;
      role: 'user' | 'seller';
    };

    if (!decoded?.id || !decoded?.role) {
      throw new AuthError('Forbidden! Invalid refresh token.');
    }

    if (decoded.role === 'seller') {
      const seller = await prisma.seller.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!seller) {
        throw new AuthError('Seller not found.');
      }

      const sellerAccessToken = jwt.sign(
        {
          id: seller.id,
          role: 'seller',
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '15m',
        },
      );

      res.cookie('seller_access_token', sellerAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Seller access token refreshed successfully',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new AuthError('User not found.');
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'User access token refreshed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const seller = await prisma.seller.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new AuthError('Invalid email or password'));
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (!isMatch) {
      return next(new AuthError('Invalid email or password'));
    }

    const accessToken = jwt.sign(
      {
        id: seller.id,
        role: 'seller',
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = jwt.sign(
      {
        id: seller.id,
        role: 'seller',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      },
    );

    res.cookie('seller_access_token', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('seller_refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Seller login successful',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, 'seller');

    const { name, email } = req.body;

    const seller = await prisma.seller.findUnique({
      where: { email },
    });

    if (seller) {
      return next(new ValidationError('Seller already exists'));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, 'seller-activation-mail');

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, phone_number, country, otp } = req.body;

    if (!name || !email || !password || !phone_number || !country || !otp) {
      return next(new ValidationError('All fields are required'));
    }

    const existingSeller = await prisma.seller.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(new ValidationError('Seller already exists with this email'));
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.seller.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        country,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Seller account created successfully',
      seller,
    });
  } catch (error) {
    console.error('VERIFY SELLER ERROR:', error);
    return next(error);
  }
};

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      bio,
      category,
      coverBanner,
      address,
      opening_hours,
      website,
      social_links,
      sellerId,
    } = req.body;

    if (!name || !category || !sellerId) {
      return next(
        new ValidationError('Shop name, category and sellerId are required'),
      );
    }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }

    const existingShop = await prisma.shop.findUnique({
      where: { sellerId },
    });

    if (existingShop) {
      return next(new ValidationError('Seller already has a shop'));
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        bio,
        category,
        coverBanner,
        address,
        opening_hours,
        website,
        social_links: social_links || [],
        sellerId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

export const createConnectStripeLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError('Seller ID is required'));
    }

    const seller = await prisma.seller.findUnique({
      where: {
        id: sellerId,
      },
    });
    if (!seller) {
      return next(new ValidationError('Seller is not available with this ID'));
    }

    let accountId = seller.stripeId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: seller.email,
        country: 'US',
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
      });
      accountId = account.id;

      await prisma.seller.update({
        where: {
          id: sellerId,
        },
        data: {
            stripeId: accountId,
        },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/seller/connect/refresh`,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/seller/connect/success`,
      type: 'account_onboarding',
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    console.error('CREATE CONNECT STRIPE LINK ERROR:', error);
    return next(error);
  }
};


export const sellerForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handleForgotPassword(req, res, next, 'seller');
  } catch (error) {
    return next(error);
  }
};

export const resetSellerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(
        new ValidationError('Email and new password are required!'),
      );
    }

    const seller = await prisma.seller.findUnique({
      where: { email },
    });

    if (!seller) {
      return next(new ValidationError('Seller not found!'));
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      seller.password,
    );

    if (isSamePassword) {
      return next(
        new ValidationError(
          'New password cannot be the same as the old password!',
        ),
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.seller.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Seller password reset successfully',
    });
  } catch (error) {
    return next(error);
  }
};


export const getSeller = (req: Request, res: Response, next: NextFunction) => {
  try {
    const seller = req.seller;

    return res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};
