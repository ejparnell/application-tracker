/**
 * @fileoverview Login page component that renders the sign-in form for user authentication.
 * This page is part of the authentication flow and provides metadata for SEO optimization.
 * Uses Next.js App Router with server-side rendering capabilities.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

/**
 * Metadata configuration for the login page.
 * Provides SEO-optimized title and description for search engines and social media sharing.
 * 
 * @type {Metadata}
 * @property {string} title - Page title displayed in browser tab and search results
 * @property {string} description - Meta description for SEO and social media previews
 */
export const metadata: Metadata = {
    title: 'Login - Application Tracker',
    description: 'Log in to your account to manage your job applications',
};

/**
 * Login page component that serves as the entry point for user authentication.
 * This is a Next.js page component that renders the SignInForm component,
 * providing a clean separation of concerns between routing and UI logic.
 * 
 * @component
 * @returns {JSX.Element} The login page containing the SignInForm component
 * 
 * @example
 * ```
 * // This page is accessed via the route: /login
 * // It automatically includes the metadata for SEO optimization
 * // and renders the SignInForm component for user interaction
 * ```
 * 
 * @see {@link SignInForm} - The actual form component that handles user input and authentication
 */
export default function LoginPage() {
    // Render the SignInForm component which contains all authentication logic
    return <SignInForm />;
}
