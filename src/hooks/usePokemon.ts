import { useState, useEffect } from 'react';
import { fallbackPokemon, fallbackGeneration } from '@/data/fallback-pokemon';

interface Pokemon {
  id: number;
  name: string;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
}

interface Generation {
  id: number;
  name: string;
  pokemon: Pokemon[];
}

const GENERATION_RANGES = {
  1: { start: 1, end: 151, name: "Generation I (Kanto)" },
  2: { start: 152, end: 251, name: "Generation II (Johto)" },
  3: { start: 252, end: 386, name: "Generation III (Hoenn)" },
  4: { start: 387, end: 493, name: "Generation IV (Sinnoh)" },
  5: { start: 494, end: 649, name: "Generation V (Unova)" },
  6: { start: 650, end: 721, name: "Generation VI (Kalos)" },
  7: { start: 722, end: 809, name: "Generation VII (Alola)" },
  8: { start: 810, end: 905, name: "Generation VIII (Galar)" },
  9: { start: 906, end: 1025, name: "Generation IX (Paldea)" }
};

// In-memory cache for Pokemon data
const pokemonCache = new Map<number, { data: Generation; timestamp: number }>();

export function usePokemon() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemonData = async (id: number, retries = 2): Promise<Pokemon | null> => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Pokemon ${id} not found`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying Pokemon ${id} (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchPokemonData(id, retries - 1);
      }
      console.warn(`Failed to fetch Pokemon ${id} after retries:`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  };

  const fetchGeneration = async (genId: number): Promise<Generation | null> => {
    // Check in-memory cache first
    const cached = pokemonCache.get(genId);
    if (cached) {
      // Check if cache is less than 24 hours old
      const cacheAge = Date.now() - cached.timestamp;
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return cached.data;
      } else {
        // Remove expired cache entry
        pokemonCache.delete(genId);
      }
    }

    const range = GENERATION_RANGES[genId as keyof typeof GENERATION_RANGES];
    if (!range) return null;

    try {
      setLoading(true);
      setError(null);

      const pokemonPromises = [];
      for (let i = range.start; i <= range.end; i++) {
        pokemonPromises.push(fetchPokemonData(i));
      }

      // Fetch in smaller batches to be more gentle on the API
      const batchSize = 10;
      const pokemon: Pokemon[] = [];
      const totalPokemon = range.end - range.start + 1;
      
      console.log(`Fetching ${totalPokemon} Pokemon for ${range.name}...`);
      
      for (let i = 0; i < pokemonPromises.length; i += batchSize) {
        const batch = pokemonPromises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        
        const validPokemon = batchResults.filter((p): p is Pokemon => p !== null);
        pokemon.push(...validPokemon);
        
        console.log(`Loaded ${pokemon.length}/${totalPokemon} Pokemon...`);
        
        // Add delay between batches to be respectful to the API
        if (i + batchSize < pokemonPromises.length) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      const generation: Generation = {
        id: genId,
        name: range.name,
        pokemon: pokemon.sort((a, b) => a.id - b.id)
      };

      // Cache the result in memory
      pokemonCache.set(genId, {
        data: generation,
        timestamp: Date.now()
      });

      return generation;
    } catch (error) {
      console.error(`Error fetching generation ${genId}:`, error);
      console.warn(`PokeAPI failed for generation ${genId}, using fallback data for Pokemon encounters`);
      
      // If this is generation 1 and we have fallback data, use it
      if (genId === 1) {
        const fallbackGenData: Generation = {
          id: 1,
          name: 'generation-i',
          pokemon: fallbackPokemon.map(fp => ({
            id: fp.id,
            name: fp.name,
            types: fp.types,
            sprites: fp.sprites,
            stats: [], // Empty stats for fallback
            height: fp.height,
            weight: fp.weight
          }))
        };
        
        // Cache the fallback data
        pokemonCache.set(genId, {
          data: fallbackGenData,
          timestamp: Date.now()
        });
        
        console.log(`🎮 Loaded fallback Pokemon data for encounters: ${fallbackGenData.pokemon.length} Pokemon available`);
        return fallbackGenData;
      }
      
      setError(`Failed to fetch generation ${genId}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadGeneration = async (genId: number) => {
    const generation = await fetchGeneration(genId);
    if (generation) {
      setGenerations(prev => {
        const existing = prev.find(g => g.id === genId);
        if (existing) {
          return prev.map(g => g.id === genId ? generation : g);
        }
        return [...prev, generation].sort((a, b) => a.id - b.id);
      });
    }
  };

  const loadAllGenerations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      for (const genId of Object.keys(GENERATION_RANGES).map(Number)) {
        await loadGeneration(genId);
      }
    } catch (error) {
      console.error('Error loading all generations:', error);
      setError('Failed to load Pokemon generations');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    pokemonCache.clear();
    setGenerations([]);
  };

  const getRandomPokemonFromCache = (targetPokemonId?: number): Pokemon | null => {
    const allGenerations = Array.from(pokemonCache.values()).map(cached => cached.data);
    
    if (allGenerations.length === 0) {
      console.warn('🎮 No Pokemon generations loaded in cache');
      return null;
    }

    // Get all Pokemon from all loaded generations
    const allPokemon: Pokemon[] = [];
    allGenerations.forEach(generation => {
      allPokemon.push(...generation.pokemon);
    });

    if (allPokemon.length === 0) {
      console.warn('🎮 No Pokemon found in loaded generations');
      return null;
    }

    // If a specific Pokemon ID is requested, try to find it first
    if (targetPokemonId) {
      const targetPokemon = allPokemon.find(p => p.id === targetPokemonId);
      if (targetPokemon) {
        console.log(`🎮 Found target Pokemon ${targetPokemon.name} (ID: ${targetPokemonId}) in cache`);
        return targetPokemon;
      } else {
        console.warn(`🎮 Target Pokemon ID ${targetPokemonId} not found in cache, selecting random Pokemon instead`);
      }
    }

    // Select a random Pokemon from the cache
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const selectedPokemon = allPokemon[randomIndex];
    
    console.log(`🎮 Selected random Pokemon ${selectedPokemon.name} (ID: ${selectedPokemon.id}) from cache of ${allPokemon.length} Pokemon`);
    return selectedPokemon;
  };

  // Initialize with fallback data if no Pokemon are cached
  useEffect(() => {
    if (pokemonCache.size === 0) {
      console.log('🎮 No Pokemon in cache, loading fallback data for encounters...');
      const fallbackGenData: Generation = {
        id: 1,
        name: 'generation-i',
        pokemon: fallbackPokemon.map(fp => ({
          id: fp.id,
          name: fp.name,
          types: fp.types,
          sprites: fp.sprites,
          stats: [], // Empty stats for fallback
          height: fp.height,
          weight: fp.weight
        }))
      };
      
      // Cache the fallback data
      pokemonCache.set(1, {
        data: fallbackGenData,
        timestamp: Date.now()
      });
      
      setGenerations([fallbackGenData]);
      console.log(`🎮 Loaded fallback Pokemon data: ${fallbackGenData.pokemon.length} Pokemon available for encounters`);
    }
  }, []);

  return {
    generations,
    loading,
    error,
    loadGeneration,
    loadAllGenerations,
    clearCache,
    getRandomPokemonFromCache
  };
}
