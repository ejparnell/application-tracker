'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import StatusBadge from '@/components/applications/StatusBadge';
import { Application } from '@/types/applications';
import styles from './ApplicationCard.module.css';

interface ApplicationCardProps {
  application: Application;
  onStatusUpdate: (applicationId: string, newStatus: string) => void;
  onRefresh: () => void;
}

export default function ApplicationCard({ application, onStatusUpdate }: ApplicationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application._id) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(application._id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewJob = () => {
    window.open(application.jobUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDaysAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      }
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    } catch {
      return application.daysAgo || '';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Text variant="h3" className={styles.title}>
            {application.title}
          </Text>
          <Text variant="body-large" color="secondary" className={styles.company}>
            {application.company}
          </Text>
          {application.location && (
            <Text variant="body-small" color="secondary" className={styles.location}>
              📍 {application.location}
            </Text>
          )}
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className={styles.metadata}>
        <div className={styles.dateInfo}>
          <Text variant="body-small" color="secondary">
            Posted: {formatDate(application.date)}
          </Text>
          <Text variant="caption" color="secondary">
            {formatDaysAgo(application.date)}
          </Text>
        </div>
        
        {application.appliedAt && (
          <div className={styles.appliedInfo}>
            <Text variant="body-small" color="success">
              Applied: {formatDate(application.appliedAt.toString())}
            </Text>
          </div>
        )}
      </div>

      <div className={styles.description}>
        <Text variant="body-small" color="secondary" className={styles.descriptionText}>
          {application.description.replace(/<[^>]*>/g, '').substring(0, 150)}
          {application.description.length > 150 ? '...' : ''}
        </Text>
      </div>

      <div className={styles.actions}>
        <div className={styles.primaryActions}>
          <Link href={`/applications/${application._id}`}>
            <Button
              variant="primary"
              size="small"
              className={styles.actionButton}
            >
              View Details
            </Button>
          </Link>

          <Link href={`/applications/${application._id}/edit`}>
            <Button
              variant="secondary"
              size="small"
              className={styles.actionButton}
            >
              Edit
            </Button>
          </Link>
          
          <Button
            variant="secondary"
            size="small"
            onClick={handleViewJob}
            className={styles.actionButton}
          >
            View Job Post
          </Button>
        </div>

        <div className={styles.statusActions}>
          {application.status !== 'applied' && (
            <Button
              variant="primary"
              size="small"
              onClick={() => handleStatusUpdate('applied')}
              disabled={isUpdating}
              className={styles.statusButton}
            >
              {isUpdating ? '...' : '✓ Mark Applied'}
            </Button>
          )}
          
          {application.status !== 'hidden' && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleStatusUpdate('hidden')}
              disabled={isUpdating}
              className={styles.statusButton}
            >
              {isUpdating ? '...' : '👁️ Hide'}
            </Button>
          )}
          
          {application.status === 'applied' && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleStatusUpdate('interview')}
              disabled={isUpdating}
              className={styles.statusButton}
            >
              {isUpdating ? '...' : '🎯 Interview'}
            </Button>
          )}
          
          {(application.status === 'applied' || application.status === 'interview') && (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isUpdating}
              className={styles.statusButton}
            >
              {isUpdating ? '...' : '❌ Rejected'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
