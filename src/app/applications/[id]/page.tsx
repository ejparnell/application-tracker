import { Metadata } from 'next';
import ApplicationDetail from '@/components/applications/ApplicationDetail';

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Application Details - Application Tracker',
  description: 'View detailed information about a job application',
};

export default async function ApplicationDetailPage({ 
  params 
}: ApplicationDetailPageProps) {
  const { id } = await params;
  
  return <ApplicationDetail applicationId={id} />;
}
