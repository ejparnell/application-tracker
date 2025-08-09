/**
 * @fileoverview API route handlers for individual job application operations.
 * Provides CRUD operations (GET, PATCH, DELETE) for specific applications by ID.
 * All endpoints require authentication and enforce user ownership of applications.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/database';
import { Application } from '@/models/application';


/**
 * Retrieves a specific job application by ID for the authenticated user.
 * Ensures that users can only access their own applications.
 * 
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the application ID
 * @param params.params - Promise resolving to an object with the application ID
 * @param params.params.id - The unique identifier of the application to retrieve
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): { application: ApplicationObject }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On not found (404): { error: 'Application not found' }
 *   - On server error (500): { error: 'Failed to fetch application' }
 * 
 * @throws {Error} Database connection or query errors are caught and handled
 * 
 * @example
 * ```
 * GET /api/applications/123456789
 * Authorization: Bearer <session-token>
 * 
 * Response:
 * {
 *   "application": {
 *     "_id": "123456789",
 *     "userId": "user123",
 *     "company": "Example Corp",
 *     "position": "Software Engineer",
 *     "status": "applied"
 *   }
 * }
 * ```
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();
    const { id } = await params;

    // Find application by ID and ensure it belongs to the authenticated user
    const application = await Application.findOne({
      _id: id,
      userId: session.user.id
    }).lean();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

/**
 * Updates a specific job application by ID for the authenticated user.
 * Handles status changes with special logic that may trigger Pokemon encounters.
 * Ensures that users can only update their own applications.
 * 
 * @param request - The incoming HTTP request with JSON body containing update data
 * @param params - Route parameters containing the application ID
 * @param params.params - Promise resolving to an object with the application ID
 * @param params.params.id - The unique identifier of the application to update
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): { success: true, application: UpdatedApplicationObject }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On not found (404): { error: 'Application not found' }
 *   - On server error (500): { error: 'Failed to update application' }
 * 
 * @throws {Error} Database connection, query, or JSON parsing errors are caught and handled
 * 
 * @example
 * ```
 * PATCH /api/applications/123456789
 * Authorization: Bearer <session-token>
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "status": "interview",
 *   "notes": "First round interview scheduled"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "application": {
 *     "_id": "123456789",
 *     "status": "interview",
 *     "notes": "First round interview scheduled",
 *     "updatedAt": "2024-01-01T12:00:00Z"
 *   }
 * }
 * ```
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();
    const { id } = await params;

    // Parse request body for update data
    const updateData = await request.json();
    
    // Find application by ID and ensure it belongs to the authenticated user
    const application = await Application.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Separate status updates from other updates for special handling
    const { status, ...otherUpdates } = updateData;
    
    // Apply non-status updates to the application object
    Object.assign(application, otherUpdates);
    
    // Handle status updates with special logic (may trigger Pokemon encounters)
    if (status && status !== application.status) {
      await application.updateStatus(status);
    } else {
      // Save changes without status update logic
      await application.save();
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

/**
 * Deletes a specific job application by ID for the authenticated user.
 * Ensures that users can only delete their own applications.
 * Uses findOneAndDelete for atomic operation.
 * 
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the application ID
 * @param params.params - Promise resolving to an object with the application ID
 * @param params.params.id - The unique identifier of the application to delete
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): { success: true, message: 'Application deleted successfully' }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On not found (404): { error: 'Application not found' }
 *   - On server error (500): { error: 'Failed to delete application' }
 * 
 * @throws {Error} Database connection or query errors are caught and handled
 * 
 * @example
 * ```
 * DELETE /api/applications/123456789
 * Authorization: Bearer <session-token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Application deleted successfully"
 * }
 * ```
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();
    const { id } = await params;

    // Find and delete application in one atomic operation
    // Ensures it belongs to the authenticated user
    const application = await Application.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
