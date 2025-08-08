import { ReactNode } from 'react';
import styles from './layout.module.css';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return <div className={styles.container}>{children}</div>;
}
