import PokemonCard from '../PokemonCard';
import styles from './PokemonGrid.module.css';

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

interface PokemonGridProps {
  generations: Generation[];
  loading: boolean;
  error: string | null;
}

export default function PokemonGrid({ generations, loading, error }: PokemonGridProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading Pokemon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No Pokemon loaded yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {generations.map((generation) => (
        <div key={generation.id} className={styles.generation}>
          <h2 className={styles.generationTitle}>
            {generation.name} ({generation.pokemon.length} Pokemon)
          </h2>
          
          <div className={styles.grid}>
            {generation.pokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
