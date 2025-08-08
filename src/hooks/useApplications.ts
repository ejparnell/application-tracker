import { useState, useEffect, useCallback } from 'react';
import { Application, ApplicationsResponse, ApplicationStats } from '@/types/applications';

interface FilterState {
  status: string;
  search: string;
  page: number;
  limit: number;
}

interface UseApplicationsReturn {
  applications: Application[];
  allStats: ApplicationStats | null;
  filteredStats: ApplicationStats | null;
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  updateApplicationStatus: (applicationId: string, newStatus: string) => Promise<void>;
  refreshApplications: () => Promise<void>;
}

export default function useApplications(): UseApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([]);
  const [allStats, setAllStats] = useState<ApplicationStats | null>(null);
  const [filteredStats, setFilteredStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FilterState>({
    status: '',
    search: '',
    page: 1,
    limit: 50 // Get more to show proper stats
  });

  // Fetch all applications stats (unfiltered)
  const fetchAllStats = useCallback(async () => {
    try {
      const response = await fetch('/api/applications?limit=1000'); // Get all for stats
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data: ApplicationsResponse = await response.json();
      setAllStats(data.stats);
    } catch (err) {
      console.error('Error fetching all stats:', err);
    }
  }, []);

  // Fetch filtered applications
  const fetchFilteredApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      params.append('sortField', 'updatedAt');
      params.append('sortOrder', 'desc');

      const response = await fetch(`/api/applications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data: ApplicationsResponse = await response.json();
      setApplications(data.applications);
      setFilteredStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    Promise.all([
      fetchAllStats(),
      fetchFilteredApplications()
    ]);
  }, [fetchAllStats, fetchFilteredApplications]);

  // Refresh when filters change (but not on initial load)
  useEffect(() => {
    fetchFilteredApplications();
  }, [filters, fetchFilteredApplications]);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const updateApplicationStatus = useCallback(async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      // Refresh both stats and applications
      await Promise.all([
        fetchAllStats(),
        fetchFilteredApplications()
      ]);
    } catch (err) {
      console.error('Error updating application:', err);
      throw err;
    }
  }, [fetchAllStats, fetchFilteredApplications]);

  const refreshApplications = useCallback(async () => {
    await Promise.all([
      fetchAllStats(),
      fetchFilteredApplications()
    ]);
  }, [fetchAllStats, fetchFilteredApplications]);

  return {
    applications,
    allStats,
    filteredStats,
    loading,
    error,
    filters,
    setFilters,
    updateApplicationStatus,
    refreshApplications
  };
}
