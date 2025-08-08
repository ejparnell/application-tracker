import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import Link from 'next/link';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import ApplicationListWithPokemon from '@/components/applications/ApplicationListWithPokemon';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Applications - Application Tracker',
    description: 'View and manage all your job applications',
};

export default async function ApplicationsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div style={{ padding: 'var(--spacing-400)', textAlign: 'center' }}>
                <Text variant="h2">Please sign in to view your applications</Text>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: 'var(--spacing-300)', 
            maxWidth: 'var(--container-large)', 
            margin: '0 auto' 
        }}>
            <header style={{ 
                marginBottom: 'var(--spacing-400)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 'var(--spacing-200)'
            }} className={styles.applicationPageHeader}>
                <div className={styles.headerText}>
                    <Text variant="h1">Your Applications</Text>
                    <div style={{ marginTop: 'var(--spacing-100)' }}>
                        <Text variant="subtext" color="secondary">
                            Manage and track all your job applications
                        </Text>
                    </div>
                </div>
                <Link href="/applications/new" className={styles.newApplicationButton}>
                    <Button variant="primary">
                        + New Application
                    </Button>
                </Link>
            </header>
            
            <ApplicationListWithPokemon />
        </div>
    );
}