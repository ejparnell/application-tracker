import mongoose, { Schema, Document } from 'mongoose';

export interface ICaughtPokemon extends Document {
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

export interface IUserPokemonStats extends Document {
  userId: string;
  totalApplications: number;
  currentStreak: number;
  lastApplicationDate: Date | null;
  totalPokemonCaught: number;
  currentEncounterRate: number;
  updatedAt: Date;
}

const CaughtPokemonSchema = new Schema<ICaughtPokemon>({
  userId: { type: String, required: true, index: true },
  pokemonId: { type: Number, required: true },
  name: { type: String, required: true },
  sprite: { type: String, required: true },
  types: [{ type: String, required: true }],
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  caughtAt: { type: Date, default: Date.now },
  encounterChance: { type: Number, required: true },
  applicationStreak: { type: Number, required: true }
});

const UserPokemonStatsSchema = new Schema<IUserPokemonStats>({
  userId: { type: String, required: true, unique: true, index: true },
  totalApplications: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastApplicationDate: { type: Date, default: null },
  totalPokemonCaught: { type: Number, default: 0 },
  currentEncounterRate: { type: Number, default: 0.15 },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for efficient queries
CaughtPokemonSchema.index({ userId: 1, caughtAt: -1 });
CaughtPokemonSchema.index({ userId: 1, pokemonId: 1 });

export const CaughtPokemon = mongoose.models.CaughtPokemon || mongoose.model<ICaughtPokemon>('CaughtPokemon', CaughtPokemonSchema);
export const UserPokemonStats = mongoose.models.UserPokemonStats || mongoose.model<IUserPokemonStats>('UserPokemonStats', UserPokemonStatsSchema);
