'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import styles from './Nav.module.css';

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/applications', label: 'Applications', icon: '📄' },
    { href: '/pokemon', label: 'Pokemon', icon: '⚡' },
    { href: '/stats', label: 'Stats', icon: '📈' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (!session) {
    return null;
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <Link href="/dashboard" className={styles.brandLink}>
            <Text variant="h3" color="primary">
              Job Tracker
            </Text>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                isActivePath(item.href) ? styles.active : ''
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <Text variant="body-large" className={styles.navText}>
                {item.label}
              </Text>
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <Text variant="body-small" color="secondary">
              {session.user?.email}
            </Text>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={handleSignOut}
            className={styles.signOutButton}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
