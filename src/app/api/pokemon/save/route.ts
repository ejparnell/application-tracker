import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PokemonGamificationService } from '@/lib/pokemon-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🎮 Pokemon save API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('🎮 No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pokemonId, pokemonData, encounterChance, streak } = body;

    if (!pokemonId || !pokemonData || encounterChance === undefined || streak === undefined) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    console.log('🎮 Saving caught Pokemon:', pokemonId, 'for user:', session.user.id);
    
    const caughtPokemon = await PokemonGamificationService.saveCaughtPokemon(
      session.user.id,
      pokemonId,
      pokemonData,
      encounterChance,
      streak
    );
    
    console.log('🎮 Pokemon saved successfully:', caughtPokemon.name);
    
    return NextResponse.json({ success: true, pokemon: caughtPokemon });
  } catch (error) {
    console.error('🎮 Error saving caught Pokemon:', error);
    return NextResponse.json(
      { error: 'Failed to save caught Pokemon' },
      { status: 500 }
    );
  }
}
