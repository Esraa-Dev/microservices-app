'use client';
import axiosInstance from '@/utils/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);

  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numeric input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await axiosInstance.post('/forgot-password-user', { email });
      return res.data;
    },

    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setServerError(null);
      setStep('otp');
      startResendTimer();
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to send OTP';

      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const res = await axiosInstance.post( '/verify-forgot-password-user',
        {
          email: userEmail,
          otp: otp.join(''),
        },
      );

      return res.data;
    },

    onSuccess: () => {
      setStep('reset');
      setServerError(null);
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage = error.response?.data?.message || 'Invalid OTP';

      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const res = await axiosInstance.post(
        '/reset-password-user',
        {
          email: userEmail,
          newPassword: password,
        },
      );

      return res.data;
    },

    onSuccess: (data) => {
      setServerError(null);
      setStep('email');
      setOtp(['', '', '', '']);
      toast.success(
        data.message ||
          'Password reset successful. Please login with your new password.',
      );
      router.push('/login');
    },

    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to reset password';

      setServerError(errorMessage);
    },
  });

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8 lg:py-12">
      <div className="w-full max-w-md">
        {/* Email Step */}
        {step === 'email' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (!userEmail) {
                setServerError('Please enter your email');
                return;
              }

              setServerError(null);
              requestOtpMutation.mutate({ email: userEmail });
            }}
            className="space-y-5 rounded-lg border border-border bg-background p-8 shadow-xl"
          >
            <div>
              <h1 className="text-2xl font-semibold text-primary-text">
                Forgot Password?
              </h1>

              <p className="mt-2 text-sm text-secondary-text">
                Enter your email address and we&apos;ll send you a verification
                code.
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />
            </div>

            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={requestOtpMutation.isPending}
              className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {requestOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
            </button>

            <p className="text-center text-sm text-secondary-text">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-5 rounded-lg border border-border bg-background p-8 shadow-xl">
            <div>
              <h1 className="text-2xl font-semibold text-primary-text">
                Verify your email
              </h1>

              <p className="mt-2 text-sm text-secondary-text">
                Enter the verification code we sent to{' '}
                <span className="font-medium text-primary-text">
                  {userEmail}
                </span>
              </p>
            </div>

            <div className="flex justify-center gap-3">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="h-12 w-12 rounded-lg border border-border bg-background text-center text-lg font-semibold text-primary-text outline-none focus:border-primary"
                />
              ))}
            </div>

            {serverError && (
              <p className="text-center text-sm text-red-500">{serverError}</p>
            )}

            <button
              type="button"
              onClick={() => {
                setServerError(null);
                verifyOtpMutation.mutate();
              }}
              disabled={
                verifyOtpMutation.isPending || otp.some((value) => !value)
              }
              className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
            </button>

            <p className="text-center text-sm text-secondary-text">
              {canResend ? (
                <>
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setServerError(null);
                      requestOtpMutation.mutate({ email: userEmail });
                    }}
                    disabled={requestOtpMutation.isPending}
                    className="cursor-pointer font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {requestOtpMutation.isPending ? 'Sending...' : 'Resend'}
                  </button>
                </>
              ) : (
                `Resend code in ${timer}s`
              )}
            </p>
          </div>
        )}

        {/* Reset Password Step */}
        {step === 'reset' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (newPassword !== confirmPassword) {
                setServerError('Passwords do not match');
                return;
              }

              setServerError(null);

              resetPasswordMutation.mutate({
                password: newPassword,
              });
            }}
            className="space-y-5 rounded-lg border border-border bg-background p-8 shadow-xl"
          >
            <div>
              <h1 className="text-2xl font-semibold text-primary-text">
                Reset Password
              </h1>

              <p className="mt-2 text-sm text-secondary-text">
                Enter your new password below.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={passwordVisible ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-primary-text outline-none focus:border-primary"
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-secondary-text"
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-primary-text outline-none focus:border-primary"
                />

                <button
                  type="button"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                  className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-secondary-text"
                >
                  {confirmPasswordVisible ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={
                resetPasswordMutation.isPending ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resetPasswordMutation.isPending
                ? 'Resetting...'
                : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
