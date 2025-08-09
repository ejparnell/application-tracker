/**
 * @fileoverview API route handler for retrieving the user's Pokemon collection.
 * This endpoint provides access to all Pokemon caught by the authenticated user
 * through the gamification system. Includes authentication and error handling.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PokemonGamificationService } from '@/lib/pokemon-service';

/**
 * Retrieves the complete Pokemon collection for the authenticated user.
 * Returns all Pokemon that have been caught through job application encounters,
 * sorted by catch date (most recent first).
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): CaughtPokemon[] - Array of caught Pokemon objects with details:
 *     - id: string - Unique database ID
 *     - userId: string - User who caught the Pokemon
 *     - pokemonId: number - Pokemon species ID
 *     - name: string - Pokemon name
 *     - sprite: string - Pokemon image URL
 *     - types: string[] - Pokemon types (e.g., ["fire", "flying"])
 *     - height: number - Pokemon height
 *     - weight: number - Pokemon weight
 *     - caughtAt: Date - When the Pokemon was caught
 *     - encounterChance: number - The encounter rate when caught (percentage)
 *     - applicationStreak: number - User's application streak when caught
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On server error (500): { error: 'Failed to fetch Pokemon collection' }
 * 
 * @throws {Error} Database connection or query errors are caught and handled
 * 
 * @example
 * ```
 * GET /api/pokemon/collection
 * Authorization: Bearer <session-token>
 * 
 * Response:
 * [
 *   {
 *     "id": "64f8a1b2c3d4e5f6a7b8c9d0",
 *     "userId": "user123",
 *     "pokemonId": 25,
 *     "name": "pikachu",
 *     "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
 *     "types": ["electric"],
 *     "height": 4,
 *     "weight": 60,
 *     "caughtAt": "2024-01-15T10:30:00.000Z",
 *     "encounterChance": 20,
 *     "applicationStreak": 3
 *   },
 *   {
 *     "id": "64f8a1b2c3d4e5f6a7b8c9d1",
 *     "userId": "user123",
 *     "pokemonId": 1,
 *     "name": "bulbasaur",
 *     "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
 *     "types": ["grass", "poison"],
 *     "height": 7,
 *     "weight": 69,
 *     "caughtAt": "2024-01-10T14:20:00.000Z",
 *     "encounterChance": 15,
 *     "applicationStreak": 1
 *   }
 * ]
 * ```
 */
export async function GET() {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve user's Pokemon collection from the gamification service
    // Returns all Pokemon caught by this user, sorted by catch date (newest first)
    const collection = await PokemonGamificationService.getUserCollection(session.user.id);
    
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching Pokemon collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon collection' },
      { status: 500 }
    );
  }
}
