'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Text from '@/components/ui/Text';
import { ApplicationStats } from '@/types/applications';
import styles from './ApplicationFilters.module.css';

interface ApplicationFiltersProps {
  onFilterChange: (filters: { status?: string; search?: string }) => void;
  allStats: ApplicationStats | null;
  totalApplications: number;
  hasActiveFilters: boolean;
}

export default function ApplicationFilters({ 
  onFilterChange, 
  allStats,
  totalApplications,
  hasActiveFilters 
}: ApplicationFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({ status: value, search });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'applied', label: 'Applied' },
    { value: 'interview', label: 'Interview' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hidden', label: 'Hidden' },
  ];

  // Use allStats for the main display, filteredStats for additional context
  const displayStats = allStats;

  return (
    <div className={styles.filters}>
      <div className={styles.filterControls}>
        <div className={styles.searchSection}>
          <Input
            type="text"
            placeholder="Search by title, company, or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.statusSection}>
          <Select
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(e.target.value)}
            className={styles.statusSelect}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {displayStats && (
        <div className={styles.stats}>
          <div className={styles.statsHeader}>
            <Text variant="body-large" color="primary">
              Application Overview
            </Text>
            {hasActiveFilters && (
              <Text variant="body-small" color="secondary">
                Showing {totalApplications} of {displayStats.total} applications
              </Text>
            )}
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Text variant="h3" color="primary">{displayStats.total}</Text>
              <Text variant="caption" color="secondary">Total</Text>
            </div>
            
            <div className={styles.statItem}>
              <Text variant="h3" color="secondary" className={styles.availableColor}>{displayStats.available}</Text>
              <Text variant="caption" color="secondary">Available</Text>
            </div>
            
            <div className={styles.statItem}>
              <Text variant="h3" color="success" className={styles.appliedColor}>{displayStats.applied}</Text>
              <Text variant="caption" color="secondary">Applied</Text>
            </div>
            
            <div className={styles.statItem}>
              <Text variant="h3" color="primary" className={styles.interviewColor}>{displayStats.interview}</Text>
              <Text variant="caption" color="secondary">Interview</Text>
            </div>
            
            <div className={styles.statItem}>
              <Text variant="h3" color="error" className={styles.rejectedColor}>{displayStats.rejected}</Text>
              <Text variant="caption" color="secondary">Rejected</Text>
            </div>
            
            <div className={styles.statItem}>
              <Text variant="h3" color="secondary" className={styles.hiddenColor}>{displayStats.hidden}</Text>
              <Text variant="caption" color="secondary">Hidden</Text>
            </div>
          </div>
          
          {displayStats.applied > 0 && (
            <div className={styles.rates}>
              <Text variant="body-small" color="secondary">
                Response Rate: {displayStats.responseRate.toFixed(1)}% • 
                Interview Rate: {displayStats.interviewRate.toFixed(1)}%
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
