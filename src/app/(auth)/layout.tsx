/**
 * @fileoverview Authentication layout component that provides consistent styling and structure
 * for all authentication-related pages (login, register, error, etc.). This layout is applied
 * to all pages within the (auth) route group using Next.js App Router layout conventions.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { ReactNode } from 'react';
import styles from './layout.module.css';

/**
 * Props interface for the AuthLayout component.
 * 
 * @interface AuthLayoutProps
 * @property {ReactNode} children - The child components/pages to be rendered within the layout
 */
interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * Authentication layout component that wraps all authentication-related pages.
 * Provides consistent styling and structure for login, register, and error pages
 * within the (auth) route group. Uses CSS modules for scoped styling.
 * 
 * @component
 * @param {AuthLayoutProps} props - The component props
 * @param {ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} A styled container wrapping the authentication pages
 * 
 * @example
 * ```tsx
 * // This layout automatically wraps pages in the (auth) route group:
 * // - /login -> AuthLayout wraps LoginPage
 * // - /register -> AuthLayout wraps RegisterPage
 * // - /error -> AuthLayout wraps AuthErrorPage
 * 
 * // The layout provides consistent styling via CSS modules
 * <AuthLayout>
 *   <LoginPage />
 * </AuthLayout>
 * ```
 * 
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts} Next.js Layout Documentation
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    // Render children within a styled container using CSS modules
    return <div className={styles.container}>{children}</div>;
}
