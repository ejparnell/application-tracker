/**
 * @fileoverview Registration page component that renders the sign-up form for new user account creation.
 * This page is part of the authentication flow and provides metadata for SEO optimization.
 * Uses Next.js App Router with server-side rendering capabilities.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

/**
 * Metadata configuration for the registration page.
 * Provides SEO-optimized title and description for search engines and social media sharing.
 * 
 * @type {Metadata}
 * @property {string} title - Page title displayed in browser tab and search results
 * @property {string} description - Meta description for SEO and social media previews
 */
export const metadata: Metadata = {
    title: 'Register - Application Tracker',
    description: 'Create a new account to start tracking your job applications',
};

/**
 * Registration page component that serves as the entry point for new user account creation.
 * This is a Next.js page component that renders the SignUpForm component,
 * providing a clean separation of concerns between routing and UI logic.
 * 
 * @component
 * @returns {JSX.Element} The registration page containing the SignUpForm component
 * 
 * @example
 * ```
 * // This page is accessed via the route: /register
 * // It automatically includes the metadata for SEO optimization
 * // and renders the SignUpForm component for user interaction
 * ```
 * 
 * @see {@link SignUpForm} - The actual form component that handles user input and registration logic
 */
export default function RegisterPage() {
    // Render the SignUpForm component which contains all registration logic
    return <SignUpForm />;
}
