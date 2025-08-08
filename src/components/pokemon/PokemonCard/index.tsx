import Image from 'next/image';
import Link from 'next/link';
import TypeBadge from '../TypeBadge';
import styles from './PokemonCard.module.css';

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

interface PokemonCardProps {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <Link href={`/pokemon/${pokemon.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <div className={styles.pokemonNumber}>#{pokemon.id.toString().padStart(3, '0')}</div>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={pokemon.name}
              width={120}
              height={120}
              className={styles.pokemonImage}
              priority={pokemon.id <= 151} // Prioritize Gen 1 Pokemon
            />
          )}
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.name}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </h3>
          
          <div className={styles.types}>
            {pokemon.types.map((type, index) => (
              <TypeBadge key={index} type={type.type.name} size="small" />
            ))}
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Height:</span>
              <span className={styles.statValue}>{(pokemon.height / 10).toFixed(1)}m</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Weight:</span>
              <span className={styles.statValue}>{(pokemon.weight / 10).toFixed(1)}kg</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Base Total:</span>
              <span className={styles.statValue}>{totalStats}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
