'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PokemonDetail from '@/components/pokemon/PokemonDetail';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

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

export default function PokemonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Pokemon ${params.id}`);
        }
        
        const pokemonData = await response.json();
        setPokemon(pokemonData);
      } catch (error) {
        console.error('Error fetching Pokemon:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch Pokemon');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading Pokemon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Pokemon not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button onClick={() => router.back()}>← Back to Pokemon</Button>
      </div>
      <PokemonDetail pokemon={pokemon} />
    </div>
  );
}
