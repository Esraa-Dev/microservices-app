import { z } from 'zod';

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z
    .string()
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type FormData = z.infer<typeof signupSchema>;