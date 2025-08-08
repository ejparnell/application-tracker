import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import Text from '@/components/ui/Text';
import QuickActions from '@/components/dashboard/QuickActions';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Dashboard - Application Tracker',
    description: 'View your job application statistics and recent activity',
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <Text variant="h1">
                    Welcome back, {session?.user?.name || 'User'}!
                </Text>
                <Text variant="subtext" color="secondary" className={styles.subtitle}>
                    Manage your job applications and track your progress
                </Text>
            </header>
            
            <QuickActions />
        </div>
    );
}
