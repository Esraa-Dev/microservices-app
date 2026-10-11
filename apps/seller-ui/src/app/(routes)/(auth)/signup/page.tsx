'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/utils/axiosInstance';

const Signup = () => {
  // =========================
  // ZOD VALIDATION
  // =========================
  const [rememberMe, setRememberMe] = useState(false);

  const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone_number: z
      .string()
      .min(8, 'Please enter a valid phone number'),
    country: z.string().min(2, 'Country is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  });

  const shopSchema = z.object({
    name: z.string().min(2, 'Shop name must be at least 2 characters'),
    bio: z.string().min(10, 'Bio must be at least 10 characters'),
    address: z.string().min(3, 'Address is required'),
    opening_hours: z
      .string()
      .min(2, 'Opening hours are required'),
    website: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),
    category: z.string().min(1, 'Please select a category'),
  });

  type SellerFormData = z.infer<typeof signupSchema>;
  type ShopFormData = z.infer<typeof shopSchema>;

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    {
      label: 'Fashion',
      value: 'fashion',
    },
    {
      label: 'Electronics',
      value: 'electronics',
    },
    {
      label: 'Beauty',
      value: 'beauty',
    },
    {
      label: 'Home & Living',
      value: 'home-living',
    },
    {
      label: 'Food',
      value: 'food',
    },
    {
      label: 'Sports',
      value: 'sports',
    },
  ];

  // =========================
  // STATES
  // =========================

  const [activeStep, setActiveStep] = useState(1);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [serverError, setServerError] = useState<string | null>(
    null,
  );

  const [showOtp, setShowOtp] = useState(false);

  const [canResend, setCanResend] = useState(true);

  const [timer, setTimer] = useState(60);

  const [otp, setOtp] = useState(['', '', '', '']);

  const [sellerData, setSellerData] =
    useState<SellerFormData | null>(null);

  const [sellerId, setSellerId] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // =========================
  // SELLER FORM
  // =========================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerFormData>({
    resolver: zodResolver(signupSchema),
  });

  // =========================
  // SHOP FORM
  // =========================

  const {
    register: registerShop,
    handleSubmit: handleShopSubmit,
    formState: { errors: shopErrors },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
  });

  // =========================
  // OTP
  // =========================

  const handleOtpChange = (
    index: number,
    value: string,
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // =========================
  // RESEND TIMER
  // =========================

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

  // =========================
  // REGISTER SELLER
  // =========================

  const registerSellerMutation = useMutation({
    mutationFn: async (data: SellerFormData) => {
      const response = await axiosInstance.post('/seller-registration', data);

      return response.data;
    },

    onSuccess: (_, data) => {
      setSellerData(data);
      setShowOtp(true);
      setServerError(null);
      startResendTimer();
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            'Something went wrong',
        );
      } else {
        setServerError('Something went wrong');
      }
    },
  });

  // =========================
  // VERIFY SELLER
  // =========================

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) {
        throw new Error('Seller data is missing');
      }

      const response = await axiosInstance.post('/verify-seller', {
        ...sellerData,
        otp: otp.join(''),
      });

      return response.data;
    },

    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setServerError(null);
      setActiveStep(2);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            'Invalid verification code',
        );
      } else {
        setServerError('Invalid verification code');
      }
    },
  });

  // =========================
  // RESEND OTP
  // =========================

  const handleResend = () => {
    if (!sellerData || !canResend) return;

    setOtp(['', '', '', '']);

    registerSellerMutation.mutate(sellerData);
  };

  // =========================
  // SELLER SUBMIT
  // =========================

  const onSellerSubmit = (data: SellerFormData) => {
    setServerError(null);

    registerSellerMutation.mutate(data);
  };

  // =========================
  // CREATE SHOP
  // =========================

  const createShopMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      if (!sellerId) {
        throw new Error('Seller ID is missing');
      }

      const response = await axiosInstance.post("/create-shop",
        {
          ...data,
          sellerId,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      setServerError(null);
      setActiveStep(3);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            'Failed to create shop',
        );
      } else {
        setServerError('Failed to create shop');
      }
    },
  });

  // =========================
  // SHOP SUBMIT
  // =========================

  const onShopSubmit = (data: ShopFormData) => {
    setServerError(null);

    createShopMutation.mutate(data);
  };

  // =========================
  // CONNECT BANK
  // =========================

  const createConnectLinkMutation = useMutation({
 mutationFn: async () => {
  if (!sellerId) {
    throw new Error('Seller ID is missing');
  }

  console.log('FRONTEND SELLER ID:', sellerId);

  const response = await axiosInstance.post(
    '/create-connect-account-link',
    {
      sellerId,
    },
  );

  console.log('STRIPE RESPONSE:', response.data);

  return response.data;
},

    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            'Failed to connect bank account',
        );
      } else {
        setServerError(
          'Failed to connect bank account',
        );
      }
    },
  });

  // =========================
  // OTP AUTO FOCUS
  // =========================

  useEffect(() => {
    if (showOtp) {
      inputRefs.current[0]?.focus();
    }
  }, [showOtp]);

  // =========================
  // JSX
  // =========================

  return (
    <div className="flex flex-col items-center justify-center">
      {/* =========================
          STEP 1 - CREATE ACCOUNT
          ========================= */}

      {activeStep === 1 && (
        <div className="w-full flex justify-center">
          {showOtp ? (
            <div className="w-full max-w-md space-y-5 rounded-lg border border-border bg-background p-8 shadow-xl">
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
                className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center text-sm text-secondary-text">
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
                  <>
                    Resend code in{' '}
                    <span className="font-bold text-primary">{timer}s</span>
                  </>
                )}
              </div>

              {serverError && (
                <p className="text-center text-sm text-red-500">{serverError}</p>
              )}
            </div>
          ) : (
            <form
              className="w-full max-w-md space-y-5 rounded-lg border border-border bg-background p-6"
              onSubmit={handleSubmit(onSellerSubmit)}
            >
              <div>
                <h1 className="text-2xl font-semibold text-primary-text">
                  Become a Seller
                </h1>

                <p className="mt-2 text-sm text-secondary-text">
                  Create a seller account to start selling your products.
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
                    htmlFor="phone_number"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone_number"
                    type="text"
                    {...register('phone_number')}
                    placeholder="Enter your phone number"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
                  />

                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone_number.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    type="text"
                    {...register('country')}
                    placeholder="Enter your country"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
                  />

                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.country.message}
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
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-10 text-primary-text outline-none focus:border-primary"
                    />

                    <div
                      className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-secondary-text"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                  </div>

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
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
                disabled={registerSellerMutation.isPending}
                className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {registerSellerMutation.isPending ? 'Sending...' : 'Create Account'}
              </button>

              {serverError && <p className="text-sm text-red-500">{serverError}</p>}

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
      )}

      {/* =========================
          STEP 2 - SET UP SHOP
          ========================= */}

      {activeStep === 2 && (
        <form
          onSubmit={handleShopSubmit(onShopSubmit)}
          className="w-full max-w-md space-y-5 rounded-lg border border-border bg-background p-6"
        >
          <div>
            <h1 className="text-2xl font-semibold text-primary-text">
              Set Up Your Shop
            </h1>

            <p className="mt-2 text-sm text-secondary-text">
              Provide your shop details to continue.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="shop_name"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Shop Name
              </label>

              <input
                id="shop_name"
                type="text"
                {...registerShop('name')}
                placeholder="Enter shop name"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {shopErrors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {shopErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Bio
              </label>

              <textarea
                id="bio"
                rows={3}
                {...registerShop('bio')}
                placeholder="Enter shop bio"
                className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {shopErrors.bio && (
                <p className="mt-1 text-sm text-red-500">
                  {shopErrors.bio.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Address
              </label>

              <input
                id="address"
                type="text"
                {...registerShop('address')}
                placeholder="Enter address"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {shopErrors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {shopErrors.address.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="opening_hours"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Opening Hours
              </label>

              <input
                id="opening_hours"
                type="text"
                {...registerShop('opening_hours')}
                placeholder="e.g. Mon - Fri: 9:00 AM - 6:00 PM"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {shopErrors.opening_hours && (
                <p className="mt-1 text-sm text-red-500">
                  {shopErrors.opening_hours.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="website"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Website (Optional)
              </label>

              <input
                id="website"
                type="text"
                {...registerShop('website')}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              />

              {shopErrors.website && (
                <p className="mt-1 text-sm text-red-500">
                  {shopErrors.website.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-primary-text"
              >
                Category
              </label>

              <select
                id="category"
                {...registerShop('category')}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-primary-text outline-none focus:border-primary"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {shopErrors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {shopErrors.category.message}
                </p>
              )}
            </div>
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <button
            type="submit"
            disabled={createShopMutation.isPending}
            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createShopMutation.isPending ? 'Creating...' : 'Continue'}
          </button>
        </form>
      )}

      {/* =========================
          STEP 3 - CONNECT BANK
          ========================= */}

      {activeStep === 3 && (
        <div className="w-full max-w-md space-y-5 rounded-lg border border-border bg-background p-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary-text">
              Connect Bank
            </h1>

            <p className="mt-2 text-sm text-secondary-text">
              Connect your bank account to receive payments directly.
            </p>
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <button
            type="button"
            onClick={() => createConnectLinkMutation.mutate()}
            disabled={createConnectLinkMutation.isPending}
            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createConnectLinkMutation.isPending
              ? 'Connecting...'
              : 'Connect Bank'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Signup;