import mongoose, { Schema, Document } from 'mongoose';

/**
 * @fileoverview Mongoose models and interfaces that power the Pokemon
 * gamification features, including caught Pokemon records and user
 * application statistics.
 *
 * @author ejparnell
 * @since 1.0.0
 */

/**
 * Document representing a Pokemon caught by a user.
 */
export interface ICaughtPokemon extends Document {
  /** User identifier that caught the Pokemon. */
  userId: string;
  /** Numeric ID of the Pokemon species. */
  pokemonId: number;
  /** Pokemon name. */
  name: string;
  /** URL to the Pokemon sprite. */
  sprite: string;
  /** Type names associated with the Pokemon. */
  types: string[];
  /** Pokemon height in decimetres. */
  height: number;
  /** Pokemon weight in hectograms. */
  weight: number;
  /** Timestamp when the Pokemon was caught. */
  caughtAt: Date;
  /** Encounter chance percentage used when catching. */
  encounterChance: number;
  /** Application streak value at the time of capture. */
  applicationStreak: number;
}

/**
 * Document storing aggregate stats for a user's Pokemon encounters.
 */
export interface IUserPokemonStats extends Document {
  /** Associated user identifier. */
  userId: string;
  /** Total number of job applications submitted by the user. */
  totalApplications: number;
  /** Current consecutive application streak. */
  currentStreak: number;
  /** Date of the user's last recorded application. */
  lastApplicationDate: Date | null;
  /** Total number of Pokemon caught by the user. */
  totalPokemonCaught: number;
  /** Current encounter rate used for gamification. */
  currentEncounterRate: number;
  /** Timestamp of the last stats update. */
  updatedAt: Date;
}

/** Schema for storing caught Pokemon information. */
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

/** Schema for storing cumulative user statistics. */
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

/** Mongoose model for caught Pokemon documents. */
export const CaughtPokemon =
  mongoose.models.CaughtPokemon ||
  mongoose.model<ICaughtPokemon>('CaughtPokemon', CaughtPokemonSchema);

/** Mongoose model for user Pokemon statistics documents. */
export const UserPokemonStats =
  mongoose.models.UserPokemonStats ||
  mongoose.model<IUserPokemonStats>('UserPokemonStats', UserPokemonStatsSchema);
