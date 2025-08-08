'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import Loading from '@/components/ui/Loading';

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const unprotectedRoutes = ['/', '/login', '/register', '/error'];

    const protectedRoutes = ['/dashboard', '/profile', '/user-profile'];

    const isUnprotectedRoute = unprotectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );

    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );

    useEffect(() => {
        if (status === 'loading') return;

        if (session && (pathname === '/login' || pathname === '/register')) {
            router.push('/dashboard');
            return;
        }

        if (!session && isProtectedRoute) {
            router.push('/login');
            return;
        }
    }, [session, status, pathname, router, isProtectedRoute]);

    if (status === 'loading') {
        return (
            <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
            }}>
                <Loading size='large' layout='center' />
            </div>
        );
    }

    return <>{children}</>;
}
