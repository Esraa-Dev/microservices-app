'use client';

import GoogleButton from '@/shared/components/google-button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, FormData } from './login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import {AxiosError} from 'axios';
import { useMutation } from '@tanstack/react-query';
import authAxiosInstance from './../../../utils/authAxiosInstance';
import { useQueryClient } from "@tanstack/react-query";
const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const queryClient=useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
  mutationFn: async (data: FormData) => {
    const res = await authAxiosInstance.post('/login-user',
      data
    );

    return res.data;
  },

  onSuccess:async  (_data) => {
  setServerError(null);

  await queryClient.invalidateQueries({
    queryKey: ["user"],
  });

  router.push("/");
  router.refresh();  },

onError: (error: AxiosError<{ message?: string }>) => {
    setServerError(
      error.response?.data?.message || 'Invalid email or password'
    );
  },
});

  const onSubmit = async (data: FormData) => {
loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center py-8 lg:py-12">
      <form
        className="w-full max-w-md space-y-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <h1 className="text-2xl font-semibold text-primary-text">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-secondary-text">
            Welcome back! Please enter your details to sign in.
          </p>
        </div>

        <div className="space-y-4">
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
  disabled={loginMutation.isPending}
  className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
>
  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
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
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
