'use client';

import GoogleButton from '@/shared/components/google-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { signupSchema, FormData } from './signup.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(signupSchema) });

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

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axiosInstance.post('/user-registration', data);
      return res.data;
    },

    onSuccess: (data, variables) => {
      toast.success(data.message);
      setUserData(variables);
      setShowOtp(true);
      startResendTimer();
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Something went wrong');
      } else {
        setServerError('Something went wrong');
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) {
        throw new Error('User data is missing');
      }

      const res = await axiosInstance.post('/verify-user', {
          ...userData,
          otp: otp.join(''),
        },
      );

      return res.data;
    },

onSuccess: (data) => {
      toast.success(data.message);
      router.push('/login');
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message || 'Invalid verification code',
        );
      } else {
        setServerError('Invalid verification code');
      }
    },
  });

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

  const handleResend = async () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  const onSubmit = (data: FormData) => {
    setServerError(null);
    signupMutation.mutate(data);
  };

  useEffect(() => {
    if (showOtp) {
      inputRefs.current[0]?.focus();
    }
  }, [showOtp]);

  return (
    <div className="flex items-center justify-center py-8 lg:py-12  h-[calc(100vh-136px)]">
      {showOtp ? (
        <div 
        className="w-full max-w-md space-y-5 shadow-xl rounded-lg border border-border bg-background p-8">
          <div>
            <h1 className="text-2xl font-semibold text-primary-text">
              Verify your email
            </h1>

            <p className="mt-2 text-sm text-secondary-text">
              Enter the verification code we sent to your email.
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

          <button
            type="button"
            onClick={() => verifyOtpMutation.mutate()}
            disabled={verifyOtpMutation.isPending}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </button>

          <p className="text-center text-sm text-secondary-text">
            {canResend ? (
              <>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className="cursor-pointer font-medium text-primary hover:underline"
                  onClick={handleResend}
                >
                  Resend
                </button>
              </>
            ) : (
              `Resend code in ${timer}s`
            )}
          </p>
        </div>
      ) : (
        <form
          className="w-full max-w-md space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <h1 className="text-2xl font-semibold text-primary-text">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-secondary-text">
              Create an account to get started with us.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="Enter your Name"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
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
                {...register('email')}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-secondary-text"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />

              <label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm text-secondary-text"
              >
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover cursor-pointer"
          >
            {signupMutation.isPending ? 'Signing up...' : 'Sign Up'}
          </button>
          {serverError && <p className="text-sm text-red-500">{serverError}</p>}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-text">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 font-medium text-primary-text transition hover:bg-surface"
          >
            <GoogleButton width={20} height={20} /> Sign in with Google
          </button>

          <p className="text-center text-sm text-secondary-text">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default Signup;
