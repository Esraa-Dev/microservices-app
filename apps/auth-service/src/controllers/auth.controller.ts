import { NextFunction, Request, Response } from 'express';
import prisma from '@ecommerce/prisma';
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import { ValidationError } from '@ecommerce/error-handler';
import bcrypt from 'bcrypt';
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
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    return next(error);
  }
};


