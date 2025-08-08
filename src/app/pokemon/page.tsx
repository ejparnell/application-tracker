'use client';

import { useState } from 'react';
import { usePokemon } from '@/hooks/usePokemon';
import PokemonGrid from '@/components/pokemon/PokemonGrid';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function PokemonPage() {
  const { generations, loading, error, loadGeneration, loadAllGenerations, clearCache } = usePokemon();
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);

  const handleLoadGeneration = async (genId: number) => {
    setSelectedGeneration(genId);
    await loadGeneration(genId);
  };

  const handleLoadAll = async () => {
    setSelectedGeneration(null);
    await loadAllGenerations();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pokemon Index</h1>
        <p className={styles.description}>
          Explore Pokemon organized by generation. Data is cached locally for faster loading.
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.generationButtons}>
          <Button
            onClick={handleLoadAll}
            variant={selectedGeneration === null ? 'primary' : 'secondary'}
            size="small"
            disabled={loading}
          >
            Load All Generations
          </Button>
          
          {Array.from({ length: 9 }, (_, i) => i + 1).map((genId) => (
            <Button
              key={genId}
              onClick={() => handleLoadGeneration(genId)}
              variant={selectedGeneration === genId ? 'primary' : 'secondary'}
              size="small"
              disabled={loading}
            >
              Gen {genId}
            </Button>
          ))}
        </div>

        <div className={styles.utilityButtons}>
          <Button
            onClick={clearCache}
            variant="secondary"
            size="small"
            disabled={loading}
          >
            Clear Cache
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <PokemonGrid 
          generations={generations} 
          loading={loading} 
          error={error} 
        />
      </div>

      {generations.length > 0 && (
        <div className={styles.stats}>
          <p className={styles.statsText}>
            Loaded {generations.length} generation{generations.length !== 1 ? 's' : ''} with{' '}
            {generations.reduce((total, gen) => total + gen.pokemon.length, 0)} Pokemon
          </p>
        </div>
      )}
    </div>
  );
}
