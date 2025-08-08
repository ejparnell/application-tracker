import styles from './TypeBadge.module.css';

interface TypeBadgeProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export default function TypeBadge({ type, size = 'medium' }: TypeBadgeProps) {
  const backgroundColor = TYPE_COLORS[type as keyof typeof TYPE_COLORS] || '#68A090';
  
  return (
    <span 
      className={`${styles.typeBadge} ${styles[size]}`}
      style={{ backgroundColor }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}
