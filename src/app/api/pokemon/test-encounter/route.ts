import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PokemonGamificationService } from '@/lib/pokemon-service';

export async function GET() {
  try {
    console.log('🎮 Test encounter API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('🎮 No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎮 Testing encounter for user:', session.user.id);
    
    // Test the Pokemon encounter system
    const encounter = await PokemonGamificationService.handleJobApplication(session.user.id);
    
    console.log('🎮 Test encounter result:', encounter);
    
    return NextResponse.json({
      message: 'Pokemon encounter test completed',
      encounter,
      userId: session.user.id
    });
  } catch (error) {
    console.error('🎮 Error in test encounter:', error);
    return NextResponse.json(
      { error: 'Failed to test Pokemon encounter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
