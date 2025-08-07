import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must be at most 100 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
    .regex(/\d/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&]/, {
        message: 'Password must contain at least one special character',
    });

const emailSchema = z
    .string()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be at most 255 characters long' })
    .min(5, { message: 'Email must be at least 5 characters long' })
    .toLowerCase();

export const registerSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});