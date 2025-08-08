import Link from 'next/link';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <Text variant="h1">Welcome to Application Tracker</Text>
            <Text variant="subtext" color="secondary">
                Track your job applications with Pokemon-style gamification!
            </Text>

            <div className={styles.actions}>
                <Link href="/register">
                    <Button variant="primary" size="large">
                        Get Started - Register
                    </Button>
                </Link>

                <Link href="/login">
                    <Button variant="secondary" size="medium">
                        Sign In
                    </Button>
                </Link>
            </div>
        </div>
    );
}
