import Image from 'next/image';
import TypeBadge from '../TypeBadge';
import styles from './PokemonDetail.module.css';

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

interface PokemonDetailProps {
  pokemon: Pokemon;
}

export default function PokemonDetail({ pokemon }: PokemonDetailProps) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={pokemon.name}
              width={200}
              height={200}
              className={styles.pokemonImage}
              priority
            />
          )}
        </div>
        
        <div className={styles.info}>
          <div className={styles.nameSection}>
            <span className={styles.pokemonNumber}>#{pokemon.id.toString().padStart(3, '0')}</span>
            <h1 className={styles.name}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h1>
          </div>
          
          <div className={styles.types}>
            {pokemon.types.map((type, index) => (
              <TypeBadge key={index} type={type.type.name} size="large" />
            ))}
          </div>
          
          <div className={styles.physicalStats}>
            <div className={styles.physicalStat}>
              <span className={styles.label}>Height</span>
              <span className={styles.value}>{(pokemon.height / 10).toFixed(1)}m</span>
            </div>
            <div className={styles.physicalStat}>
              <span className={styles.label}>Weight</span>
              <span className={styles.value}>{(pokemon.weight / 10).toFixed(1)}kg</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Base Stats</h2>
        <div className={styles.stats}>
          {pokemon.stats.map((stat, index) => (
            <div key={index} className={styles.stat}>
              <span className={styles.statName}>
                {stat.stat.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={styles.statValue}>{stat.base_stat}</span>
              <div className={styles.statBar}>
                <div 
                  className={styles.statFill}
                  style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
