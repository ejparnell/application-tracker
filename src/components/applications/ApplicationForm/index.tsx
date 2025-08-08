'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Form from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { applicationSchema, ApplicationFormData } from '@/utils/schemas/application-schema';
import { CreateApplicationData } from '@/types/applications';
import styles from './ApplicationForm.module.css';

interface ApplicationFormProps {
  onSubmit?: (data: CreateApplicationData | ApplicationFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ApplicationFormData>;
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function ApplicationForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  isLoading = false,
  isEditing = false
}: ApplicationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ApplicationFormData>({
    title: initialData?.title || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    jobUrl: initialData?.jobUrl || '',
    description: initialData?.description || '',
    salary: initialData?.salary || '',
    status: initialData?.status || 'available',
    notes: initialData?.notes || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInputChange = (field: keyof ApplicationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      applicationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const fieldErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
        
        zodError.errors?.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0] as keyof ApplicationFormData] = err.message;
          }
        });
        
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Please fix the errors above before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default API call if no custom onSubmit provided
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create application');
        }

        setNotification({ type: 'success', message: 'Application created successfully! Redirecting...' });
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/applications');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create application. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Text variant="h2">{isEditing ? 'Edit Application' : 'Create New Application'}</Text>
        <Text variant="subtext" color="secondary">
          {isEditing ? 'Update your job application details' : 'Add a new job application to track your progress'}
        </Text>
      </header>

      <Form onSubmit={handleSubmit} className={styles.form}>
        {notification && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            <Text variant="body-large" color={notification.type === 'error' ? 'error' : 'success'}>
              {notification.message}
            </Text>
          </div>
        )}

        <div className={styles.formGrid}>
          {/* Job Title */}
          <div className={styles.formGroup}>
            <Input
              id="title"
              label="Job Title *"
              value={formData.title}
              onChange={handleInputChange('title')}
              error={errors.title}
              placeholder="e.g. Senior Software Engineer"
              disabled={loading}
            />
          </div>

          {/* Company */}
          <div className={styles.formGroup}>
            <Input
              id="company"
              label="Company *"
              value={formData.company}
              onChange={handleInputChange('company')}
              error={errors.company}
              placeholder="e.g. Google"
              disabled={loading}
            />
          </div>

          {/* Location */}
          <div className={styles.formGroup}>
            <Input
              id="location"
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              error={errors.location}
              placeholder="e.g. San Francisco, CA"
              disabled={loading}
            />
          </div>

          {/* Salary */}
          <div className={styles.formGroup}>
            <Input
              id="salary"
              label="Salary"
              value={formData.salary}
              onChange={handleInputChange('salary')}
              error={errors.salary}
              placeholder="e.g. $120,000 - $150,000"
              disabled={loading}
            />
          </div>

          {/* Job URL */}
          <div className={styles.formGroupFullWidth}>
            <Input
              id="jobUrl"
              label="Job URL *"
              type="url"
              value={formData.jobUrl}
              onChange={handleInputChange('jobUrl')}
              error={errors.jobUrl}
              placeholder="https://example.com/job-posting"
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Status *
            </label>
            <Select
              id="status"
              value={formData.status}
              onChange={handleInputChange('status')}
              disabled={loading}
            >
              <option value="available">Available</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="hidden">Hidden</option>
            </Select>
            {errors.status && (
              <span className={styles.error}>{errors.status}</span>
            )}
          </div>

          {/* Job Description */}
          <div className={styles.formGroupFullWidth}>
            <label htmlFor="description" className={styles.label}>
              Job Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Paste the job description here..."
              className={styles.textarea}
              rows={8}
              disabled={loading}
            />
            {errors.description && (
              <span className={styles.error}>{errors.description}</span>
            )}
          </div>

          {/* Notes */}
          <div className={styles.formGroupFullWidth}>
            <label htmlFor="notes" className={styles.label}>
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="Add any additional notes about this application..."
              className={styles.textarea}
              rows={4}
              disabled={loading}
            />
            {errors.notes && (
              <span className={styles.error}>{errors.notes}</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Application' : 'Create Application')}
          </Button>
        </div>
      </Form>
    </div>
  );
}
