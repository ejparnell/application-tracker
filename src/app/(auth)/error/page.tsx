/**
 * @fileoverview Authentication error page component that displays user-friendly error messages
 * for various authentication failures. Reads error codes from URL search parameters and
 * provides navigation options back to sign-in or home page.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Authentication error page component that handles and displays various authentication errors.
 * This component is typically navigated to when authentication providers (like NextAuth.js)
 * encounter errors during the sign-in process.
 * 
 * @component
 * @returns {JSX.Element} The authentication error page with error message and navigation options
 * 
 * @example
 * ```
 * // This page is typically accessed via URL navigation with error parameters:
 * // /auth/error?error=Configuration
 * // /auth/error?error=AccessDenied
 * // /auth/error?error=Verification
 * ```
 */
export default function AuthErrorPage() {
    // Extract error parameter from URL search params
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    /**
     * Maps authentication error codes to user-friendly error messages.
     * Provides specific messages for known error types and a fallback for unknown errors.
     * 
     * @param error - The error code from URL search parameters (can be null)
     * @returns {string} User-friendly error message corresponding to the error code
     * 
     * @example
     * ```typescript
     * getErrorMessage('Configuration') // Returns: "There is a problem with the server configuration."
     * getErrorMessage('AccessDenied')  // Returns: "You do not have permission to sign in."
     * getErrorMessage(null)           // Returns: "An unexpected error occurred. Please try again."
     * ```
     */
    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                // Server configuration issues (e.g., missing environment variables)
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                // User denied access or lacks necessary permissions
                return 'You do not have permission to sign in.';
            case 'Verification':
                // Email verification token expired or already used
                return 'The verification token has expired or has already been used.';
            case 'Default':
                // Generic authentication error
                return 'An error occurred during authentication.';
            default:
                // Fallback for unknown or null error codes
                return 'An unexpected error occurred. Please try again.';
        }
    };

    return (
        <div>
            <div>
                {/* Main error heading */}
                <h1>Authentication Error</h1>

                {/* Display user-friendly error message */}
                <p>{getErrorMessage(error)}</p>

                {/* Show technical error code if available (for debugging purposes) */}
                {error && <p>Error code: {error}</p>}

                <div>
                    {/* Navigation options for user recovery */}
                    <Link href="/signin">Try Again</Link>

                    <Link href="/">Go Home</Link>
                </div>
            </div>
        </div>
    );
}
