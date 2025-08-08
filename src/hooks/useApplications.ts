import { useState, useEffect, useCallback } from 'react';
import { Application, ApplicationsResponse, ApplicationStats } from '@/types/applications';
import type { PokemonEncounter } from '@/models/pokemon';
import type { Pokemon } from '@/types/pokemon-types';

interface FilterState {
  status: string;
  search: string;
  page: number;
  limit: number;
}

interface UseApplicationsProps {
  getRandomPokemonFromCache?: (targetPokemonId?: number) => Pokemon | null;
}

interface UseApplicationsReturn {
  applications: Application[];
  allStats: ApplicationStats | null;
  filteredStats: ApplicationStats | null;
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  updateApplicationStatus: (applicationId: string, newStatus: string) => Promise<PokemonEncounter | null>;
  refreshApplications: () => Promise<void>;
}

export default function useApplications({ getRandomPokemonFromCache }: UseApplicationsProps = {}): UseApplicationsReturn {
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
  const fetchFilteredApplications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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
      if (showLoading) {
        setLoading(false);
      }
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

  const updateApplicationStatus = useCallback(async (applicationId: string, newStatus: string): Promise<PokemonEncounter | null> => {
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

      // Trigger Pokemon encounter if status is changed to 'applied'
      let pokemonEncounter: PokemonEncounter | null = null;
      if (newStatus === 'applied') {
        console.log('🎮 Triggering Pokemon encounter for status change to applied');
        try {
          const pokemonResponse = await fetch('/api/pokemon/encounter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('🎮 Pokemon encounter response status:', pokemonResponse.status);
          
          if (pokemonResponse.ok) {
            const encounterResult = await pokemonResponse.json();
            console.log('🎮 Pokemon encounter result:', encounterResult);
            
            if (encounterResult.success && encounterResult.pokemonId) {
              // Try to get Pokemon data from cache first
              console.log('🎮 Looking for Pokemon data in cache for ID:', encounterResult.pokemonId);
              
              let pokemonData = null;
              if (getRandomPokemonFromCache) {
                pokemonData = getRandomPokemonFromCache(encounterResult.pokemonId);
              }
              
              if (pokemonData) {
                console.log('🎮 Found Pokemon data in cache:', pokemonData.name);
                
                // Save the caught Pokemon to database
                const saveResponse = await fetch('/api/pokemon/save', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    pokemonId: encounterResult.pokemonId,
                    pokemonData,
                    encounterChance: encounterResult.encounterChance,
                    streak: encounterResult.newStreak
                  }),
                });
                
                if (saveResponse.ok) {
                  const saveResult = await saveResponse.json();
                  console.log('🎮 Pokemon saved successfully:', saveResult.pokemon.name);
                  
                  // Return the full encounter with Pokemon data
                  pokemonEncounter = {
                    success: true,
                    pokemon: saveResult.pokemon,
                    encounterChance: encounterResult.encounterChance,
                    newStreak: encounterResult.newStreak
                  };
                } else {
                  // Failed to save Pokemon, but still show successful encounter
                  pokemonEncounter = {
                    success: true,
                    pokemon: {
                      id: '',
                      userId: '',
                      pokemonId: pokemonData.id,
                      name: pokemonData.name,
                      sprite: pokemonData.sprites.other['official-artwork']?.front_default || pokemonData.sprites.front_default,
                      types: pokemonData.types.map(t => t.type.name),
                      height: pokemonData.height,
                      weight: pokemonData.weight,
                      caughtAt: new Date(),
                      encounterChance: encounterResult.encounterChance,
                      applicationStreak: encounterResult.newStreak
                    },
                    encounterChance: encounterResult.encounterChance,
                    newStreak: encounterResult.newStreak
                  };
                }
              } else {
                console.warn('🎮 Pokemon data not found in cache, user needs to load Pokemon data first');
                // Show encounter successful but no Pokemon data available
                pokemonEncounter = {
                  success: true,
                  pokemon: null,
                  encounterChance: encounterResult.encounterChance,
                  newStreak: encounterResult.newStreak
                };
              }
            } else {
              // No Pokemon encountered - still show modal
              pokemonEncounter = {
                success: false,
                pokemon: null,
                encounterChance: encounterResult.encounterChance,
                newStreak: encounterResult.newStreak
              };
            }
          } else {
            const errorText = await pokemonResponse.text();
            console.error('🎮 Pokemon encounter failed:', errorText);
            // Show error modal with default values
            pokemonEncounter = {
              success: false,
              pokemon: null,
              encounterChance: 15, // Default base rate
              newStreak: 1
            };
          }
        } catch (pokemonError) {
          console.error('🎮 Error triggering Pokemon encounter:', pokemonError);
          // Show error modal with default values
          pokemonEncounter = {
            success: false,
            pokemon: null,
            encounterChance: 15, // Default base rate
            newStreak: 1
          };
        }
      }

      // Refresh both stats and applications (without loading state)
      await Promise.all([
        fetchAllStats(),
        fetchFilteredApplications(false)
      ]);

      return pokemonEncounter;
    } catch (err) {
      console.error('Error updating application:', err);
      throw err;
    }
  }, [fetchAllStats, fetchFilteredApplications]);

  const refreshApplications = useCallback(async () => {
    await Promise.all([
      fetchAllStats(),
      fetchFilteredApplications(false)
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
