'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Pages where we don't want to show the nav
  const authPages = ['/login', '/register', '/'];
  const hideNav = authPages.includes(pathname) || !session;

  return (
    <div className={styles.layout}>
      {!hideNav && <Nav />}
      <main className={`${styles.main} ${hideNav ? styles.fullHeight : ''}`}>
        {children}
      </main>
    </div>
  );
}
