import type { Metadata } from 'next';
import { League_Spartan } from 'next/font/google';
import SessionProvider from '@/components/auth/SessionProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';

const leagueSpartan = League_Spartan({
    variable: '--font-league-spartan',
    subsets: ['latin'],
    weight: ['400', '700'],
});

export const metadata: Metadata = {
    title: 'Job Application Tracker',
    description: 'Track and manage your job applications efficiently',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${leagueSpartan.variable}`}>
                <SessionProvider>
                    <AuthGuard>
                        <MainLayout>
                            {children}
                        </MainLayout>
                    </AuthGuard>
                </SessionProvider>
            </body>
        </html>
    );
}
