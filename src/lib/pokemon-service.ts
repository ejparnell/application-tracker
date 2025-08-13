import { CaughtPokemon, UserPokemonStats } from './pokemon-gamification';
import { dbConnect } from './database';
import type {
  PokemonEncounter,
  CaughtPokemon as CaughtPokemonType,
  UserPokemonStats as UserPokemonStatsType
} from '@/models/pokemon';

/**
 * @fileoverview Service encapsulating Pokemon encounter logic and user
 * gamification statistics for job applications.
 *
 * @author ejparnell
 * @since 1.0.0
 */

/**
 * Provides utilities to trigger encounters, store captured Pokemon and
 * retrieve statistics related to the gamification system.
 */
export class PokemonGamificationService {
  private static readonly BASE_ENCOUNTER_RATE = 0.15; // 15%
  private static readonly STREAK_BONUS = 0.05; // 5% per day
  private static readonly MAX_ENCOUNTER_RATE = 0.75; // 75%
  private static readonly MIN_POKEMON_ID = 1;
  private static readonly MAX_POKEMON_ID = 1010;

  /**
   * Handles a job application and calculates whether a Pokemon encounter
   * occurs. The actual Pokemon selection is performed client-side using
   * cached data.
   *
   * @param userId - Identifier of the user applying for a job.
   * @returns Encounter result including chance and potential Pokemon data.
   */
  static async triggerEncounter(userId: string): Promise<PokemonEncounter> {
    await dbConnect();

    // Update user stats
    const stats = await this.updateUserStats(userId);
    
    // Calculate encounter chance
    const encounterChance = Math.min(
      this.BASE_ENCOUNTER_RATE + (stats.currentStreak * this.STREAK_BONUS),
      this.MAX_ENCOUNTER_RATE
    );

    // Roll for encounter
    const roll = Math.random();
    const success = roll < encounterChance;

    console.log(`🎮 Encounter check: ${(roll * 100).toFixed(1)}% roll vs ${(encounterChance * 100).toFixed(1)}% chance = ${success ? 'SUCCESS' : 'FAIL'}`);

    if (!success) {
      return {
        success: false,
        encounterChance: encounterChance * 100,
        newStreak: stats.currentStreak
      };
    }

    // Generate random Pokemon ID for frontend to select from cache
    const pokemonId = Math.floor(Math.random() * (this.MAX_POKEMON_ID - this.MIN_POKEMON_ID + 1)) + this.MIN_POKEMON_ID;
    
    console.log(`🎮 Pokemon encounter successful! Generated Pokemon ID: ${pokemonId}`);

    return {
      success: true,
      pokemonId: pokemonId,
      encounterChance: encounterChance * 100,
      newStreak: stats.currentStreak,
      encounterData: {
        userId,
        pokemonId,
        caughtAt: new Date(),
        encounterChance: encounterChance * 100,
        applicationStreak: stats.currentStreak
      }
    };
  }

  /**
   * Updates the user's application statistics and streak values.
   *
   * @param userId - User identifier whose stats are updated.
   * @returns Updated user Pokemon statistics document.
   */
  private static async updateUserStats(userId: string): Promise<UserPokemonStatsType> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let stats = await UserPokemonStats.findOne({ userId });

    if (!stats) {
      // Create new user stats
      stats = new UserPokemonStats({
        userId,
        totalApplications: 1,
        currentStreak: 1,
        lastApplicationDate: today,
        totalPokemonCaught: 0,
        currentEncounterRate: this.BASE_ENCOUNTER_RATE,
        updatedAt: now
      });
      await stats.save();
      return stats.toObject();
    }

    // Calculate streak
    const lastAppDate = stats.lastApplicationDate ? new Date(stats.lastApplicationDate) : null;
    const lastAppDay = lastAppDate ? new Date(lastAppDate.getFullYear(), lastAppDate.getMonth(), lastAppDate.getDate()) : null;
    
    let newStreak = stats.currentStreak;

    if (!lastAppDay) {
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastAppDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, don't change streak
        newStreak = stats.currentStreak;
      } else if (daysDiff === 1) {
        // Consecutive day, increase streak
        newStreak = stats.currentStreak + 1;
      } else {
        // Missed days, reset streak
        newStreak = 1;
      }
    }

    // Update stats
    stats.totalApplications += 1;
    stats.currentStreak = newStreak;
    stats.lastApplicationDate = today;
    stats.updatedAt = now;
    
    await stats.save();
    return stats.toObject();
  }

  /**
   * Persists a caught Pokemon to the database after an encounter is
   * resolved on the client.
   *
   * @param userId - ID of the user who caught the Pokemon.
   * @param pokemonId - Numeric ID of the captured Pokemon.
   * @param pokemonData - Detailed Pokemon data from the PokeAPI cache.
   * @param encounterChance - Encounter probability used when catching.
   * @param streak - User's application streak at capture time.
   * @returns The saved {@link CaughtPokemonType} document.
   */
  static async saveCaughtPokemon(
    userId: string,
    pokemonId: number,
    pokemonData: {
      id: number;
      name: string;
      sprites: {
        other: { 'official-artwork': { front_default: string } };
        front_default: string;
      };
      types: { type: { name: string } }[];
      height: number;
      weight: number;
    },
    encounterChance: number,
    streak: number
  ): Promise<CaughtPokemonType> {
    await dbConnect();

    const caughtPokemon = new CaughtPokemon({
      userId,
      pokemonId: pokemonData.id,
      name: pokemonData.name,
      sprite: pokemonData.sprites.other['official-artwork']?.front_default || pokemonData.sprites.front_default,
      types: pokemonData.types.map((t: { type: { name: string } }) => t.type.name),
      height: pokemonData.height,
      weight: pokemonData.weight,
      caughtAt: new Date(),
      encounterChance,
      applicationStreak: streak
    });
    
    await caughtPokemon.save();
    
    return caughtPokemon.toObject();
  }

  /**
   * Retrieves a user's caught Pokemon collection sorted by capture date.
   *
   * @param userId - ID of the user whose collection is requested.
   * @returns Array of caught Pokemon documents.
   */
  static async getUserCollection(userId: string): Promise<CaughtPokemonType[]> {
    await dbConnect();
    
    const pokemon = await CaughtPokemon.find({ userId })
      .sort({ caughtAt: -1 })
      .lean();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return pokemon.map((p: any) => ({
      id: p._id.toString(),
      userId: p.userId,
      pokemonId: p.pokemonId,
      name: p.name,
      sprite: p.sprite,
      types: p.types,
      height: p.height,
      weight: p.weight,
      caughtAt: p.caughtAt,
      encounterChance: p.encounterChance,
      applicationStreak: p.applicationStreak
    }));
  }

  /**
   * Fetches gamification statistics for a given user.
   *
   * @param userId - User identifier.
   * @returns User stats or `null` if none exist.
   */
  static async getUserStats(userId: string): Promise<UserPokemonStatsType | null> {
    await dbConnect();
    
    const stats = await UserPokemonStats.findOne({ userId }).lean();
    if (!stats) return null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = stats as any;
    return {
      userId: s.userId,
      totalApplications: s.totalApplications,
      currentStreak: s.currentStreak,
      lastApplicationDate: s.lastApplicationDate,
      totalPokemonCaught: s.totalPokemonCaught,
      currentEncounterRate: s.currentEncounterRate
    };
  }

  /**
   * Computes aggregate statistics about a user's Pokemon collection.
   *
   * @param userId - ID of the user for whom stats are calculated.
   * @returns Summary of collection metrics including totals and streaks.
   */
  static async getCollectionStats(userId: string) {
    await dbConnect();
    
    const stats = await this.getUserStats(userId);
    const collection = await this.getUserCollection(userId);
    
    const uniquePokemon = new Set(collection.map(p => p.pokemonId)).size;
    const totalCaught = collection.length;
    const recentCatch = collection[0] || null;
    
    return {
      totalApplications: stats?.totalApplications || 0,
      currentStreak: stats?.currentStreak || 0,
      totalCaught,
      uniquePokemon,
      currentEncounterRate: ((stats?.currentEncounterRate || 0.15) * 100).toFixed(1),
      recentCatch
    };
  }
}
