export interface CaughtPokemon {
  id: string;
  userId: string;
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

export interface UserPokemonStats {
  userId: string;
  totalApplications: number;
  currentStreak: number;
  lastApplicationDate: Date | null;
  totalPokemonCaught: number;
  currentEncounterRate: number;
}

export interface PokemonEncounter {
  success: boolean;
  pokemon?: CaughtPokemon | null;
  pokemonId?: number;
  encounterChance: number;
  newStreak: number;
  encounterData?: {
    userId: string;
    pokemonId: number;
    caughtAt: Date;
    encounterChance: number;
    applicationStreak: number;
  };
}
