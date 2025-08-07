import { ReactNode } from 'react';
import UserProfile from '@/components/auth/UserProfile';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div>

      <UserProfile
        showSignOut={true}
      />
        {children}
      
    </div>
  );
}