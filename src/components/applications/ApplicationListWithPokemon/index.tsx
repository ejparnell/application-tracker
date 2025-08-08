'use client';

import { useState } from 'react';
import ApplicationCard from '@/components/applications/ApplicationCard';
import ApplicationFilters from '@/components/applications/ApplicationFilters';
import Loading from '@/components/ui/Loading';
import Text from '@/components/ui/Text';
import PokemonEncounterModal from '@/components/pokemon/PokemonEncounterModal';
import useApplications from '@/hooks/useApplications';
import { usePokemon } from '@/hooks/usePokemon';
import { PokemonEncounter } from '@/models/pokemon';
import styles from './ApplicationListWithPokemon.module.css';

export default function ApplicationListWithPokemon() {
  const { getRandomPokemonFromCache } = usePokemon();
  const {
    applications,
    allStats,
    loading,
    error,
    filters,
    setFilters,
    updateApplicationStatus,
    refreshApplications
  } = useApplications({ getRandomPokemonFromCache });

  const [pokemonEncounter, setPokemonEncounter] = useState<PokemonEncounter | null>(null);
  const [showPokemonModal, setShowPokemonModal] = useState(false);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const encounter = await updateApplicationStatus(applicationId, newStatus);
      if (encounter) {
        setPokemonEncounter(encounter);
        setShowPokemonModal(true);
      }
      return encounter;
    } catch (err) {
      console.error('Error updating application:', err);
      return null;
    }
  };

  const handleFilterChange = (newFilters: { status?: string; search?: string }) => {
    setFilters(newFilters);
  };

  const handleClosePokemonModal = () => {
    setShowPokemonModal(false);
    setPokemonEncounter(null);
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

      {/* Pokemon Encounter Modal */}
      {pokemonEncounter && (
        <PokemonEncounterModal
          isOpen={showPokemonModal}
          onClose={handleClosePokemonModal}
          success={pokemonEncounter.success}
          pokemon={pokemonEncounter.pokemon || undefined}
          encounterChance={pokemonEncounter.encounterChance}
          streak={pokemonEncounter.newStreak}
        />
      )}
    </div>
  );
}
