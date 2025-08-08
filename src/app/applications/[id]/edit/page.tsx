import { Metadata } from 'next';
import EditApplicationForm from '@/components/applications/EditApplicationForm';

interface EditApplicationPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Application - Application Tracker',
  description: 'Edit job application details',
};

export default async function EditApplicationPage({ 
  params 
}: EditApplicationPageProps) {
  const { id } = await params;
  
  return <EditApplicationForm applicationId={id} />;
}
