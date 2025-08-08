'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface SignOutButtonProps {
    children?: React.ReactNode;
    redirectTo?: string;
    callbackUrl?: string;
}

export default function SignOutButton({
    children = 'Sign Out',
    redirectTo,
    callbackUrl = '/',
}: SignOutButtonProps) {
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            await signOut({
                callbackUrl: redirectTo || callbackUrl,
                redirect: true,
            });
        } catch (error) {
            console.error('Sign out failed:', error);
            setIsSigningOut(false);
        }
    };

    return (
        <button onClick={handleSignOut} disabled={isSigningOut} type="button">
            {isSigningOut ? <>Signing Out...</> : children}
        </button>
    );
}
