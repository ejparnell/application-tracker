'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Loading from '@/components/ui/Loading';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import StatusBadge from '@/components/applications/StatusBadge';
import { Application } from '@/types/applications';
import styles from './ApplicationDetail.module.css';

interface ApplicationDetailProps {
  applicationId: string;
  onBack?: () => void;
}

export default function ApplicationDetail({ applicationId, onBack }: ApplicationDetailProps) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!applicationId) return;

    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/applications/${applicationId}`);
        
        if (!response.ok) {
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

    fetchApplication();
  }, [applicationId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application?._id) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/applications/${application._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      const data = await response.json();
      setApplication(data.application);
    } catch (err) {
      console.error('Error updating application:', err);
    } finally {
      setIsUpdating(false);
    }
  };

    const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!application?._id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/applications/${application._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      if (onBack) {
        onBack();
      } else {
        router.push('/applications');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      // You could add error handling here
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return String(dateString);
    }
  };

  const formatDateTime = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateString);
    }
  };

  const getDaysAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      }
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    } catch {
      return application?.daysAgo || '';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className={styles.errorContainer}>
        <Text variant="h2" color="error">Error</Text>
        <Text variant="body-large" color="secondary">
          {error || 'Application not found'}
        </Text>
        <Link href="/applications">
          <Button variant="secondary">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/applications" className={styles.backLink}>
            <Text variant="body-small" color="secondary">← Back to Applications</Text>
          </Link>
        </div>
        
        <div className={styles.titleSection}>
          <div className={styles.titleGroup}>
            <Text variant="h1" className={styles.title}>
              {application.title}
            </Text>
            <StatusBadge status={application.status} />
          </div>
          
          <Text variant="h3" color="secondary" className={styles.company}>
            {application.company}
          </Text>
          
          {application.location && (
            <Text variant="body-large" color="secondary" className={styles.location}>
              📍 {application.location}
            </Text>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <Text variant="h3" className={styles.sectionTitle}>Job Description</Text>
            <div 
              className={styles.description}
              dangerouslySetInnerHTML={{ 
                __html: application.description || 'No description available' 
              }}
            />
          </section>

          <section className={styles.section}>
            <Text variant="h3" className={styles.sectionTitle}>Job Details</Text>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <Text variant="body-small" color="secondary">Posted Date</Text>
                <Text variant="body-large">{formatDate(application.date)}</Text>
                <Text variant="caption" color="secondary">{getDaysAgo(application.date)}</Text>
              </div>
              
              <div className={styles.detailItem}>
                <Text variant="body-small" color="secondary">Job URL</Text>
                <a 
                  href={application.jobUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.jobLink}
                >
                  <Text variant="body-large" color="primary">View Original Posting</Text>
                </a>
              </div>

              {application.salary && (
                <div className={styles.detailItem}>
                  <Text variant="body-small" color="secondary">Salary</Text>
                  <Text variant="body-large">{application.salary}</Text>
                </div>
              )}

              {application.appliedAt && (
                <div className={styles.detailItem}>
                  <Text variant="body-small" color="secondary">Applied Date</Text>
                  <Text variant="body-large" color="success">
                    {formatDateTime(application.appliedAt)}
                  </Text>
                </div>
              )}

              {application.interviewDate && (
                <div className={styles.detailItem}>
                  <Text variant="body-small" color="secondary">Interview Date</Text>
                  <Text variant="body-large" color="primary">
                    {formatDateTime(application.interviewDate)}
                  </Text>
                </div>
              )}
            </div>
          </section>

          {application.notes && (
            <section className={styles.section}>
              <Text variant="h3" className={styles.sectionTitle}>Notes</Text>
              <div className={styles.notes}>
                <Text variant="body-large">{application.notes}</Text>
              </div>
            </section>
          )}

          {(application.resumeContent || application.coverLetter) && (
            <section className={styles.section}>
              <Text variant="h3" className={styles.sectionTitle}>Application Materials</Text>
              
              {application.resumeContent && (
                <div className={styles.materialItem}>
                  <Text variant="body-large" color="secondary">Resume Content</Text>
                  <div className={styles.materialContent}>
                    <Text variant="body-small">{application.resumeContent}</Text>
                  </div>
                </div>
              )}

              {application.coverLetter && (
                <div className={styles.materialItem}>
                  <Text variant="body-large" color="secondary">Cover Letter</Text>
                  <div className={styles.materialContent}>
                    <Text variant="body-small">{application.coverLetter}</Text>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.actionCard}>
            <Text variant="h3" className={styles.cardTitle}>Quick Actions</Text>
            
            <div className={styles.actionButtons}>
              <Link href={`/applications/${application._id}/edit`}>
                <Button variant="primary" size="large" className={styles.actionButton}>
                  Edit Application
                </Button>
              </Link>

              <a 
                href={application.jobUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="large" className={styles.actionButton}>
                  View Job Posting
                </Button>
              </a>

              {application.status !== 'applied' && (
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => handleStatusUpdate('applied')}
                  disabled={isUpdating}
                  className={styles.actionButton}
                >
                  {isUpdating ? 'Updating...' : 'Mark as Applied'}
                </Button>
              )}

              {application.status === 'applied' && (
                <Button
                  variant="secondary"
                  size="large"
                  onClick={() => handleStatusUpdate('interview')}
                  disabled={isUpdating}
                  className={styles.actionButton}
                >
                  {isUpdating ? 'Updating...' : 'Mark as Interview'}
                </Button>
              )}

              {(application.status === 'applied' || application.status === 'interview') && (
                <Button
                  variant="danger"
                  size="large"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isUpdating}
                  className={styles.actionButton}
                >
                  {isUpdating ? 'Updating...' : 'Mark as Rejected'}
                </Button>
              )}

              {application.status !== 'hidden' && (
                <Button
                  variant="secondary"
                  size="large"
                  onClick={() => handleStatusUpdate('hidden')}
                  disabled={isUpdating}
                  className={styles.actionButton}
                >
                  {isUpdating ? 'Updating...' : 'Hide Application'}
                </Button>
              )}
            </div>
          </div>

          <div className={styles.actionCard}>
            <Text variant="h3" className={styles.cardTitle}>Application Info</Text>
            
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Text variant="body-small" color="secondary">Application ID</Text>
                <Text variant="caption" color="secondary">#{application.id}</Text>
              </div>
              
              <div className={styles.infoItem}>
                <Text variant="body-small" color="secondary">Date Added</Text>
                <Text variant="caption" color="secondary">
                  {formatDateTime(application.dateLoaded)}
                </Text>
              </div>
              
              {application.createdAt && (
                <div className={styles.infoItem}>
                  <Text variant="body-small" color="secondary">Created</Text>
                  <Text variant="caption" color="secondary">
                    {formatDateTime(application.createdAt)}
                  </Text>
                </div>
              )}
              
              {application.updatedAt && (
                <div className={styles.infoItem}>
                  <Text variant="body-small" color="secondary">Last Updated</Text>
                  <Text variant="caption" color="secondary">
                    {formatDateTime(application.updatedAt)}
                  </Text>
                </div>
              )}
            </div>
          </div>

          <div className={styles.dangerZone}>
            <Text variant="body-large" color="error" className={styles.dangerTitle}>
              Danger Zone
            </Text>
            <Button
              variant="danger"
              size="medium"
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              Delete Application
            </Button>
            <Text variant="caption" color="secondary">
              This action cannot be undone
            </Text>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete Application"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
