import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApplicationImporter } from '@/lib/importer';

// POST /api/applications/import - Import applications from data.json
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { source } = body;

    let result;
    
    if (source === 'root-data') {
      // Import from the data.json file in the project root
      result = await ApplicationImporter.migrateDataFromRoot(session.user.id);
    } else if (source === 'json-data' && body.data) {
      // Import from provided JSON data
      result = await ApplicationImporter.importFromArray(body.data, session.user.id);
    } else {
      return NextResponse.json(
        { error: 'Invalid import source. Use "root-data" or provide "json-data" with data array.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result.success,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      message: `Import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors`
    });

  } catch (error) {
    console.error('Error importing applications:', error);
    return NextResponse.json(
      { error: 'Failed to import applications' },
      { status: 500 }
    );
  }
}
