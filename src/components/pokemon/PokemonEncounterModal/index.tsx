import React from 'react';
import Image from 'next/image';
import TypeBadge from '../TypeBadge';
import Button from '@/components/ui/Button';
import styles from './PokemonEncounterModal.module.css';

interface CaughtPokemon {
  id: string;
  pokemonId: number;
  name: string;
  sprite: string;
  types: string[];
  height: number;
  weight: number;
  encounterChance: number;
  applicationStreak: number;
}

interface PokemonEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  pokemon?: CaughtPokemon;
  encounterChance: number;
  streak: number;
}

export default function PokemonEncounterModal({
  isOpen,
  onClose,
  success,
  pokemon,
  encounterChance,
  streak
}: PokemonEncounterModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {success && pokemon ? (
          <div className={styles.successContent}>
            <div className={styles.header}>
              <h2 className={styles.title}>🎉 Pokemon Caught!</h2>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            
            <div className={styles.pokemonDisplay}>
              <div className={styles.imageContainer}>
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  width={150}
                  height={150}
                  className={styles.pokemonImage}
                  priority
                />
              </div>
              
              <div className={styles.pokemonInfo}>
                <div className={styles.nameSection}>
                  <span className={styles.pokemonNumber}>#{pokemon.pokemonId.toString().padStart(3, '0')}</span>
                  <h3 className={styles.pokemonName}>
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                  </h3>
                </div>
                
                <div className={styles.types}>
                  {pokemon.types.map((type, index) => (
                    <TypeBadge key={index} type={type} size="medium" />
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
                </div>
              </div>
            </div>
            
            <div className={styles.encounterInfo}>
              <p className={styles.encounterText}>
                Caught with {encounterChance.toFixed(1)}% encounter chance
              </p>
              <p className={styles.streakText}>
                Current application streak: {streak} day{streak !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className={styles.actions}>
              <Button onClick={onClose} variant="primary">
                Continue Applying!
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.failContent}>
            <div className={styles.header}>
              <h2 className={styles.title}>😔 No Pokemon This Time</h2>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            
            <div className={styles.failMessage}>
              <div className={styles.failIcon}>🌱</div>
              <p>Keep applying to jobs to increase your encounter chance!</p>
              <p className={styles.encounterText}>
                Current encounter rate: {encounterChance.toFixed(1)}%
              </p>
              <p className={styles.streakText}>
                Application streak: {streak} day{streak !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className={styles.actions}>
              <Button onClick={onClose} variant="primary">
                Keep Trying!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
