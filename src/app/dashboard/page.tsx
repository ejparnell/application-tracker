import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Application Tracker',
  description: 'View your job application statistics and recent activity',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  

  return (
    <div>
        <h1>Welcome to your Dashboard</h1>
    </div>
  );
}
