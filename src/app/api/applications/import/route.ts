/**
 * @fileoverview API route handler for importing job applications from various data sources.
 * Supports importing from root data.json file or from provided JSON data arrays.
 * Includes validation, error handling, and detailed import result reporting.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApplicationImporter } from '@/lib/importer';

/**
 * Imports job applications from various data sources for the authenticated user.
 * Supports two import modes: from root data.json file or from provided JSON data.
 * All imported applications are associated with the authenticated user's ID.
 * 
 * @param request - The incoming HTTP request with JSON body containing import configuration
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): {
 *       success: boolean,
 *       imported: number,
 *       skipped: number,
 *       errors: string[],
 *       message: string
 *     }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On bad request (400): { error: 'Invalid import source...' }
 *   - On server error (500): { error: 'Failed to import applications' }
 * 
 * @throws {Error} JSON parsing, authentication, or import operation errors are caught and handled
 * 
 * @example
 * ```
 * // Import from root data.json file
 * POST /api/applications/import
 * Authorization: Bearer <session-token>
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "source": "root-data"
 * }
 * 
 * // Import from provided data array
 * POST /api/applications/import
 * Authorization: Bearer <session-token>
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "source": "json-data",
 *   "data": [
 *     {
 *       "company": "Example Corp",
 *       "position": "Software Engineer",
 *       "status": "applied"
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "imported": 5,
 *   "skipped": 2,
 *   "errors": [],
 *   "message": "Import completed: 5 imported, 2 skipped, 0 errors"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body to get import configuration
    const body = await request.json();
    const { source } = body;

    let result;
    
    if (source === 'root-data') {
      // Uses ApplicationImporter to migrate existing data for the user
      result = await ApplicationImporter.migrateDataFromRoot(session.user.id);
    } else if (source === 'json-data' && body.data) {
      // Validates and imports each application in the provided data
      result = await ApplicationImporter.importFromArray(body.data, session.user.id);
    } else {
      // Invalid import source or missing required data
      return NextResponse.json(
        { error: 'Invalid import source. Use "root-data" or provide "json-data" with data array.' },
        { status: 400 }
      );
    }

    // Return detailed import results including counts and any errors
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
