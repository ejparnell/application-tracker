'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import TypeBadge from '../TypeBadge';
import styles from './PokemonCollection.module.css';

interface CaughtPokemon {
  id: string;
  pokemonId: number;
  name: string;
  sprite: string;
  types: string[];
  height: number;
  weight: number;
  caughtAt: Date;
  encounterChance: number;
  applicationStreak: number;
}

interface CollectionStats {
  totalApplications: number;
  currentStreak: number;
  totalCaught: number;
  uniquePokemon: number;
  currentEncounterRate: string;
  recentCatch: CaughtPokemon | null;
}

export default function PokemonCollection() {
  const [collection, setCollection] = useState<CaughtPokemon[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [collectionRes, statsRes] = await Promise.all([
          fetch('/api/pokemon/collection'),
          fetch('/api/pokemon/stats')
        ]);
        
        if (!collectionRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch Pokemon data');
        }
        
        const [collectionData, statsData] = await Promise.all([
          collectionRes.json(),
          statsRes.json()
        ]);
        
        setCollection(collectionData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        setError('Failed to load Pokemon collection');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your Pokemon collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {stats && (
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Collection Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalApplications}</div>
              <div className={styles.statLabel}>Total Applications</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.currentStreak}</div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalCaught}</div>
              <div className={styles.statLabel}>Pokemon Caught</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.uniquePokemon}</div>
              <div className={styles.statLabel}>Unique Pokemon</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.currentEncounterRate}%</div>
              <div className={styles.statLabel}>Encounter Rate</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.collectionSection}>
        <h2 className={styles.sectionTitle}>
          Your Pokemon Collection ({collection.length})
        </h2>
        
        {collection.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎮</div>
            <h3>No Pokemon Caught Yet</h3>
            <p>Apply to jobs to start encountering Pokemon!</p>
            <p className={styles.encouragement}>
              Each application gives you a chance to catch wild Pokemon. 
              The more you apply, the better your chances become!
            </p>
          </div>
        ) : (
          <div className={styles.pokemonGrid}>
            {collection.map((pokemon) => (
              <div key={pokemon.id} className={styles.pokemonCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.pokemonNumber}>
                    #{pokemon.pokemonId.toString().padStart(3, '0')}
                  </span>
                  <span className={styles.caughtDate}>
                    {new Date(pokemon.caughtAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className={styles.imageContainer}>
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    width={100}
                    height={100}
                    className={styles.pokemonImage}
                  />
                </div>
                
                <div className={styles.pokemonInfo}>
                  <h3 className={styles.pokemonName}>
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                  </h3>
                  
                  <div className={styles.types}>
                    {pokemon.types.map((type, index) => (
                      <TypeBadge key={index} type={type} size="small" />
                    ))}
                  </div>
                  
                  <div className={styles.catchInfo}>
                    <div className={styles.catchStat}>
                      <span>Encounter:</span>
                      <span>{pokemon.encounterChance.toFixed(1)}%</span>
                    </div>
                    <div className={styles.catchStat}>
                      <span>Streak:</span>
                      <span>{pokemon.applicationStreak}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
