'use client';

import { useSession } from 'next-auth/react';
import SignOutButton from '@/components/auth/SignOutButton';

interface UserProfileProps {
    showSignOut?: boolean;
}

export default function UserProfile({ showSignOut = true }: UserProfileProps) {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div>
                <div data-testid="profile-loading">
                    <div></div>
                    <div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated' || !session?.user) {
        return (
            <div>
                <div data-testid="profile-unauthenticated">
                    <p>Please sign in to view profile</p>
                </div>
            </div>
        );
    }

    const { user } = session;
    const displayName = user.name || user.email?.split('@')[0] || 'User';
    const initials = getInitials(displayName);

    return (
        <div data-testid="user-profile">
            <div>
                <div data-testid="user-avatar">
                    {user.image ? (
                        <img src={user.image} alt={`${displayName} avatar`} />
                    ) : (
                        <div data-testid="avatar-fallback">{initials}</div>
                    )}
                </div>

                <div>
                    <h3 data-testid="user-name">{displayName}</h3>
                    {user.email && <p data-testid="user-email">{user.email}</p>}
                </div>

                {showSignOut && (
                    <div>
                        <SignOutButton>Sign Out</SignOutButton>
                    </div>
                )}
            </div>
        </div>
    );
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}
