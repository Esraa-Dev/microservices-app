import { NextFunction, Request, Response } from 'express';
import prisma from '@ecommerce/prisma';
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from '../utils/auth.helper';
import { ValidationError } from '@ecommerce/error-handler';

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
