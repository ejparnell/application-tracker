export interface Pokemon {
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

export interface Generation {
  id: number;
  name: string;
  pokemon: Pokemon[];
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export interface GenerationRange {
  start: number;
  end: number;
  name: string;
}

export const GENERATION_RANGES: Record<number, GenerationRange> = {
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
