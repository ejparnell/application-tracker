/**
 * @fileoverview API route handler for triggering Pokemon encounters in the gamification system.
 * This endpoint calculates encounter rates based on user application streaks and determines
 * if a Pokemon encounter occurs. Used when job application status changes to "applied".
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PokemonGamificationService } from '@/lib/pokemon-service';

/**
 * Triggers a Pokemon encounter for the authenticated user based on their application activity.
 * Calculates encounter probability using base rate (15%) plus streak bonuses (5% per day),
 * with a maximum of 75%. Updates user statistics and determines encounter success.
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On successful encounter (200): {
 *       success: true,
 *       pokemonId: number,
 *       encounterChance: number,
 *       newStreak: number,
 *       encounterData: {
 *         userId: string,
 *         pokemonId: number,
 *         caughtAt: Date,
 *         encounterChance: number,
 *         applicationStreak: number
 *       }
 *     }
 *   - On failed encounter (200): {
 *       success: false,
 *       encounterChance: number,
 *       newStreak: number
 *     }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On server error (500): { error: 'Failed to process Pokemon encounter' }
 * 
 * @throws {Error} Database connection, user stats, or encounter calculation errors are caught and handled
 * 
 * @example
 * ```
 * POST /api/pokemon/encounter
 * Authorization: Bearer <session-token>
 * 
 * // Successful encounter response:
 * {
 *   "success": true,
 *   "pokemonId": 25,
 *   "encounterChance": 25,
 *   "newStreak": 3,
 *   "encounterData": {
 *     "userId": "user123",
 *     "pokemonId": 25,
 *     "caughtAt": "2024-01-15T10:30:00.000Z",
 *     "encounterChance": 25,
 *     "applicationStreak": 3
 *   }
 * }
 * 
 * // Failed encounter response:
 * {
 *   "success": false,
 *   "encounterChance": 20,
 *   "newStreak": 2
 * }
 * ```
 * 
 * @note This endpoint only calculates encounter rates and generates Pokemon IDs.
 *       The frontend is responsible for selecting actual Pokemon data from cache
 *       and calling the save endpoint to persist caught Pokemon.
 */
export async function POST() {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Trigger Pokemon encounter calculation
    // This updates user stats, calculates encounter probability, and determines success
    // Only generates Pokemon ID - frontend handles actual Pokemon data selection from cache
    const encounter = await PokemonGamificationService.triggerEncounter(session.user.id);
    
    return NextResponse.json(encounter);
  } catch (error) {
    console.error('🎮 Error handling Pokemon encounter:', error);
    return NextResponse.json(
      { error: 'Failed to process Pokemon encounter' },
      { status: 500 }
    );
  }
}
