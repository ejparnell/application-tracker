import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ApplicationForm from '@/components/applications/ApplicationForm';

export const metadata: Metadata = {
    title: 'New Application - Application Tracker',
    description: 'Create a new job application',
};

export default async function NewApplicationPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return <ApplicationForm />;
}