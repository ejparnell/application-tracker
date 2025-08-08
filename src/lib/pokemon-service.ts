import { CaughtPokemon, UserPokemonStats } from './pokemon-gamification';
import { dbConnect } from './database';
import type { PokemonEncounter, CaughtPokemon as CaughtPokemonType, UserPokemonStats as UserPokemonStatsType } from '@/models/pokemon';

export class PokemonGamificationService {
  private static readonly BASE_ENCOUNTER_RATE = 0.15; // 15%
  private static readonly STREAK_BONUS = 0.05; // 5% per day
  private static readonly MAX_ENCOUNTER_RATE = 0.75; // 75%
  private static readonly MIN_POKEMON_ID = 1;
  private static readonly MAX_POKEMON_ID = 1010;

  /**
   * Handles a job application and potential Pokemon encounter
   */
  static async handleJobApplication(userId: string): Promise<PokemonEncounter> {
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

    if (!success) {
      return {
        success: false,
        encounterChance: encounterChance * 100,
        newStreak: stats.currentStreak
      };
    }

    // Generate random Pokemon encounter
    const pokemonEncounter = await this.generatePokemonEncounter(userId, encounterChance, stats.currentStreak);
    
    if (!pokemonEncounter) {
      return {
        success: false,
        encounterChance: encounterChance * 100,
        newStreak: stats.currentStreak
      };
    }

    // Update stats with caught Pokemon
    await UserPokemonStats.findOneAndUpdate(
      { userId },
      { 
        $inc: { totalPokemonCaught: 1 },
        currentEncounterRate: encounterChance
      }
    );

    return {
      success: true,
      pokemonId: pokemonEncounter.pokemonId,
      encounterChance: encounterChance * 100,
      newStreak: stats.currentStreak,
      encounterData: pokemonEncounter.encounterData
    };
  }

  /**
   * Updates user application stats and streak
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
   * Generates a random Pokemon encounter (returns just the Pokemon ID to be fetched on frontend)
   */
  private static async generatePokemonEncounter(
    userId: string, 
    encounterChance: number, 
    streak: number
  ): Promise<{ pokemonId: number; encounterData: { userId: string; pokemonId: number; caughtAt: Date; encounterChance: number; applicationStreak: number } } | null> {
    try {
      // Generate random Pokemon ID
      const pokemonId = Math.floor(Math.random() * (this.MAX_POKEMON_ID - this.MIN_POKEMON_ID + 1)) + this.MIN_POKEMON_ID;
      
      // Return the Pokemon ID and encounter metadata - frontend will fetch the actual Pokemon data
      return {
        pokemonId,
        encounterData: {
          userId,
          pokemonId,
          caughtAt: new Date(),
          encounterChance: encounterChance * 100,
          applicationStreak: streak
        }
      };
    } catch (error) {
      console.error('Error generating Pokemon encounter:', error);
      return null;
    }
  }

  /**
   * Saves a caught Pokemon to the database (called after frontend fetches Pokemon data)
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
   * Gets user's Pokemon collection
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
   * Gets user's Pokemon stats
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
   * Gets collection statistics
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
