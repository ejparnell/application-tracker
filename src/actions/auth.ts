/**
 * @fileoverview Server-side authentication actions for user registration and login.
 * Contains Next.js server actions that handle form data validation, password hashing,
 * user creation, and authentication logic with comprehensive error handling.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

'use server';

import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { dbConnect } from '@/lib/database';
import { User } from '@/models/user';
import { registerSchema, loginSchema } from '@/utils/schemas/auth-schema';
import { ActionState } from '../types/auth';

/**
 * Handles user registration by validating form data, checking for existing users,
 * and creating a new user account with hashed password.
 * 
 * @param prevState - Previous action state from form submission (can be null for initial state)
 * @param formData - Form data containing email, password, and confirmPassword fields
 * 
 * @returns Promise<ActionState> - Action result containing:
 *   - success: boolean indicating if registration was successful
 *   - email: user's email (on success)
 *   - password: user's password (on success, for potential auto-login)
 *   - error: error message (on failure)
 *   - fieldErrors: field-specific validation errors
 * 
 * @throws {ZodError} - Validation errors are caught and converted to ActionState
 * @throws {Error} - Database and other errors are caught and handled gracefully
 * 
 * @example
 * ```typescript
 * // In a React component with useFormState
 * const [state, formAction] = useFormState(registerAction, null);
 * 
 * return (
 *   <form action={formAction}>
 *     <input name="email" type="email" required />
 *     <input name="password" type="password" required />
 *     <input name="confirmPassword" type="password" required />
 *     <button type="submit">Register</button>
 *   </form>
 * );
 * ```
 */
export async function registerAction(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    try {
        // Extract form data fields
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validate input data using Zod schema
        const validatedData = registerSchema.parse({
            email,
            password,
            confirmPassword,
        });

        // Connect to database
        await dbConnect();

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return {
                success: false,
                error: 'User with this email already exists',
                fieldErrors: {},
            };
        }

        // Create new user (password will be hashed by the User model pre-save hook)
        await User.create({
            email: validatedData.email,
            password: validatedData.password,
        });

        // Return success state with user credentials
        return {
            success: true,
            email: validatedData.email,
            password: validatedData.password,
            fieldErrors: {},
        };
    } catch (error) {
        // Handle Zod validation errors
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

        // Handle unexpected errors
        console.error('Registration error:', error);
        return {
            success: false,
            error: 'An error occurred during registration',
            fieldErrors: {},
        };
    }
}

/**
 * Handles user sign-in by validating credentials and authenticating against
 * the database using bcrypt password comparison.
 * 
 * @param prevState - Previous action state from form submission (can be null for initial state)
 * @param formData - Form data containing email and password fields
 * 
 * @returns Promise<ActionState> - Action result containing:
 *   - success: boolean indicating if authentication was successful
 *   - email: user's email (on success)
 *   - password: user's password (on success, for session creation)
 *   - error: error message (on failure)
 *   - fieldErrors: field-specific validation errors
 * 
 * @throws {ZodError} - Validation errors are caught and converted to ActionState
 * @throws {Error} - Database and other errors are caught and handled gracefully
 * 
 * @security
 * - Passwords are compared using bcrypt.compare() for secure hash verification
 * - Generic error messages prevent user enumeration attacks
 * - Password field is explicitly selected from database query using .select('+password')
 * 
 * @example
 * ```typescript
 * // In a React component with useFormState
 * const [state, formAction] = useFormState(signinAction, null);
 * 
 * return (
 *   <form action={formAction}>
 *     <input name="email" type="email" required />
 *     <input name="password" type="password" required />
 *     <button type="submit">Sign In</button>
 *   </form>
 * );
 * ```
 */
export async function signinAction(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    try {
        // Extract form data fields
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Validate input data using Zod schema
        const validatedData = loginSchema.parse({
            email,
            password,
        });

        // Connect to database
        await dbConnect();

        // Find user by email and include password field (normally excluded by default)
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

        // Verify password using bcrypt comparison
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

        // Return success state with user credentials
        return {
            success: true,
            email: validatedData.email,
            password: validatedData.password,
            fieldErrors: {},
        };
    } catch (error) {
        // Handle Zod validation errors
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

        // Handle unexpected errors
        console.error('Sign in error:', error);
        return {
            success: false,
            error: 'An error occurred during sign in',
            fieldErrors: {},
        };
    }
}
