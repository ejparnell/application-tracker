'use client';

import ApplicationCard from '@/components/applications/ApplicationCard';
import ApplicationFilters from '@/components/applications/ApplicationFilters';
import Loading from '@/components/ui/Loading';
import Text from '@/components/ui/Text';
import useApplications from '@/hooks/useApplications';
import styles from './ApplicationList.module.css';

export default function ApplicationList() {
  const {
    applications,
    allStats,
    loading,
    error,
    filters,
    setFilters,
    updateApplicationStatus,
    refreshApplications
  } = useApplications();

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      return await updateApplicationStatus(applicationId, newStatus);
    } catch (err) {
      console.error('Error updating application:', err);
      return null;
    }
  };

  const handleFilterChange = (newFilters: { status?: string; search?: string }) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Text variant="h3" color="error">Error</Text>
        <Text variant="body-large" color="secondary">{error}</Text>
      </div>
    );
  }

  return (
    <div className={styles.applicationList}>
      <ApplicationFilters 
        onFilterChange={handleFilterChange}
        allStats={allStats}
        totalApplications={applications.length}
        hasActiveFilters={!!(filters.status || filters.search)}
      />
      
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <Text variant="h3" color="secondary">No applications found</Text>
          <Text variant="body-large" color="secondary">
            {filters.status || filters.search 
              ? 'Try adjusting your filters or search criteria'
              : 'Start by importing your job data or adding new applications'
            }
          </Text>
        </div>
      ) : (
        <div className={styles.grid}>
          {applications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onStatusUpdate={handleStatusUpdate}
              onRefresh={refreshApplications}
            />
          ))}
        </div>
      )}

      {applications.length > 0 && (
        <div className={styles.pagination}>
          <Text variant="body-small" color="secondary">
            Showing {applications.length} 
            {filters.status || filters.search ? ' filtered' : ''} applications
            {allStats && allStats.total !== applications.length && 
              ` of ${allStats.total} total`
            }
          </Text>
        </div>
      )}
    </div>
  );
}
