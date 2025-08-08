import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PokemonGamificationService } from '@/lib/pokemon-service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
