'use server';

import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { dbConnect } from '@/lib/database';
import { User } from '@/models/user';
import { registerSchema, loginSchema } from '@/utils/schemas/auth-schema';
import { ActionState } from '../types/auth';

export async function registerAction(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        const validatedData = registerSchema.parse({
            email,
            password,
            confirmPassword,
        });

        await dbConnect();

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return {
                success: false,
                error: 'User with this email already exists',
                fieldErrors: {},
            };
        }

        await User.create({
            email: validatedData.email,
            password: validatedData.password,
        });

        return {
            success: true,
            email: validatedData.email,
            password: validatedData.password,
            fieldErrors: {},
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const fieldErrors: Record<string, string> = {};
            error.errors.forEach((err) => {
                if (err.path) {
                    fieldErrors[err.path.join('.')] = err.message;
                }
            });
            return {
                success: false,
                error: 'Validation failed',
                fieldErrors,
            };
        }

        console.error('Registration error:', error);
        return {
            success: false,
            error: 'An error occurred during registration',
            fieldErrors: {},
        };
    }
}

export async function signinAction(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const validatedData = loginSchema.parse({
            email,
            password,
        });

        await dbConnect();

        const user = await User.findOne({ email: validatedData.email }).select(
            '+password'
        );
        if (!user) {
            return {
                success: false,
                error: 'Invalid email or password',
                fieldErrors: {},
            };
        }

        const isValidPassword = await bcrypt.compare(
            validatedData.password,
            user.password
        );
        if (!isValidPassword) {
            return {
                success: false,
                error: 'Invalid email or password',
                fieldErrors: {},
            };
        }

        return {
            success: true,
            email: validatedData.email,
            password: validatedData.password,
            fieldErrors: {},
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const fieldErrors: Record<string, string> = {};
            error.errors.forEach((err) => {
                if (err.path) {
                    fieldErrors[err.path.join('.')] = err.message;
                }
            });
            return {
                success: false,
                error: 'Validation failed',
                fieldErrors,
            };
        }

        console.error('Sign in error:', error);
        return {
            success: false,
            error: 'An error occurred during sign in',
            fieldErrors: {},
        };
    }
}
