/**
 * @fileoverview NextAuth.js API route handler for authentication endpoints.
 * This file sets up the NextAuth dynamic route handler that manages all authentication
 * flows including sign-in, sign-out, session management, and OAuth callbacks.
 * Uses the catch-all route pattern [...nextauth] to handle multiple auth endpoints.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth.js handler instance configured with application-specific authentication options.
 * This handler processes all authentication-related requests and manages user sessions.
 * 
 * @constant {NextAuthHandler} handler - The configured NextAuth handler
 * 
 * @see {@link authOptions} - Authentication configuration imported from @/lib/auth
 * 
 * @example
 * ```
 * // This handler automatically manages the following endpoints:
 * // GET  /api/auth/signin - Sign-in page and form handling
 * // POST /api/auth/signin - Process sign-in credentials
 * // GET  /api/auth/signout - Sign-out page
 * // POST /api/auth/signout - Process sign-out request
 * // GET  /api/auth/session - Get current user session
 * // GET  /api/auth/csrf - Get CSRF token
 * // GET  /api/auth/providers - Get configured auth providers
 * // GET  /api/auth/callback/[provider] - OAuth callback endpoints
 * ```
 */
const handler = NextAuth(authOptions);
/**
 * Export the NextAuth handler for both GET and POST HTTP methods.
 * This enables the handler to process all authentication requests using the appropriate HTTP method.
 * The catch-all route pattern [...nextauth] allows NextAuth to handle multiple endpoint paths.
 * 
 * @exports {NextAuthHandler} GET - Handles GET requests for authentication endpoints
 * @exports {NextAuthHandler} POST - Handles POST requests for authentication endpoints
 * 
 * @example
 * ```
 * // GET requests handle:
 * // - Sign-in/sign-out page rendering
 * // - Session retrieval
 * // - CSRF token generation
 * // - Provider information
 * // - OAuth callback processing
 * 
 * // POST requests handle:
 * // - Credential validation and sign-in
 * // - Sign-out processing
 * // - Session updates
 * ```
 */
export { handler as GET, handler as POST };
