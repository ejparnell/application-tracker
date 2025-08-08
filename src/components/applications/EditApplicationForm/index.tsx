'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ApplicationForm from '@/components/applications/ApplicationForm';
import Loading from '@/components/ui/Loading';
import Text from '@/components/ui/Text';
import { Application, UpdateApplicationData, CreateApplicationData } from '@/types/applications';
import { ApplicationFormData } from '@/utils/schemas/application-schema';
import styles from './EditApplicationForm.module.css';

interface EditApplicationFormProps {
  applicationId: string;
}

export default function EditApplicationForm({ applicationId }: EditApplicationFormProps) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/applications/${applicationId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Application not found');
          }
          throw new Error('Failed to fetch application');
        }

        const data = await response.json();
        setApplication(data.application);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const handleSubmit = async (data: ApplicationFormData | CreateApplicationData) => {
    if (!application?._id) return;

    setIsSubmitting(true);
    
    try {
      // Ensure data has the required structure for editing
      const formData = data as ApplicationFormData;
      
      const updateData: UpdateApplicationData = {
        title: formData.title,
        company: formData.company,
        location: formData.location || undefined,
        jobUrl: formData.jobUrl,
        description: formData.description,
        salary: formData.salary || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      };

      const response = await fetch(`/api/applications/${application._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application');
      }

      // Redirect to the application detail page
      router.push(`/applications/${application._id}`);
    } catch (error) {
      console.error('Error updating application:', error);
      // The ApplicationForm component will handle error display
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/applications/${applicationId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <Text variant="body-large" color="secondary">
          Loading application details...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Text variant="h2" color="error">Error</Text>
        <Text variant="body-large" color="secondary">{error}</Text>
        <button 
          onClick={() => router.push('/applications')}
          className={styles.backButton}
        >
          Back to Applications
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className={styles.errorContainer}>
        <Text variant="h2" color="error">Application Not Found</Text>
        <Text variant="body-large" color="secondary">
          The application you&apos;re trying to edit could not be found.
        </Text>
        <button 
          onClick={() => router.push('/applications')}
          className={styles.backButton}
        >
          Back to Applications
        </button>
      </div>
    );
  }

  // Convert Application to ApplicationFormData
  const initialData: Partial<ApplicationFormData> = {
    title: application.title,
    company: application.company,
    location: application.location || '',
    jobUrl: application.jobUrl,
    description: application.description,
    salary: application.salary || '',
    status: application.status,
    notes: application.notes || '',
  };

  return (
    <div className={styles.container}>
      <ApplicationForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        isEditing={true}
      />
    </div>
  );
}
