import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PokemonGamificationService } from '@/lib/pokemon-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🎮 Pokemon encounter API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('🎮 No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎮 Processing encounter for user:', session.user.id);
    
    const encounter = await PokemonGamificationService.handleJobApplication(session.user.id);
    
    console.log('🎮 Encounter result:', encounter);
    
    return NextResponse.json(encounter);
  } catch (error) {
    console.error('🎮 Error handling Pokemon encounter:', error);
    return NextResponse.json(
      { error: 'Failed to process Pokemon encounter' },
      { status: 500 }
    );
  }
}
