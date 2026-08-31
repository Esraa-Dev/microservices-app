import { ValidationError } from '@ecommerce/error-handler';

import crypto from 'crypto';
import { sendEmail } from './sendMail';
import redis from '@ecommerce/redis';
import { NextFunction } from 'express';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller',
) => {
  const { name, email, password, phone_number, country } = data;

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format!');
  }

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError('Missing required fields!');
  }
};

export const checkOtpRestrictions = async (email: string) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      'Account locked due to multiple failed attempts. Try again after 30 minutes.',
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      'Too many OTP requests. Please wait 1 hour before requesting again.',
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      'Please wait 1 minute before requesting another OTP.',
    );
  }
};

export const trackOtpRequests = async (email: string) => {
  const otpRequestKey = `otp_requests_count:${email}`;

  const otpRequestCount = parseInt((await redis.get(otpRequestKey)) || '0', 10);

  if (otpRequestCount >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 3600);

    throw new ValidationError(
      'Too many OTP requests. Please wait 1 hour before requesting again.',
    );
  }

  await redis.set(otpRequestKey, (otpRequestCount + 1).toString(), 'EX', 3600);
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, 'Verify your email', template, {
    name,
    otp,
  });

  await redis.set(`otp:${email}`, otp, 'EX', 300);

  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
  email: string,
  inputOtp: string,
  next: NextFunction,
) => {
  const storedOtpKey = `otp:${email}`;
  const failedAttemptsKey = `otp_attempts:${email}`;

  const storedOtp = await redis.get(storedOtpKey);

  if (!storedOtp) {
    throw new ValidationError('Expired or invalid OTP!');
  }

  const failedAttempts = parseInt(
    (await redis.get(failedAttemptsKey)) || '0',
    10,
  );

  if (storedOtp !== inputOtp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800); //locked for 30 minutes
      await redis.del(storedOtpKey, failedAttemptsKey);
      throw new ValidationError(
        'Too many failed attempts. Your account is locked for 30 minutes.',
      );
    }

    await redis.set(
      failedAttemptsKey,
      (failedAttempts + 1).toString(),
      'EX',
      300,
    );
    return next(
      new ValidationError(
        `Incorrect OTP. You have ${2 - failedAttempts} attempts left.`,
      ),
    );
  }
  await redis.del(storedOtpKey,failedAttemptsKey);
};
