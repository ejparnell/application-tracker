/**
 * @fileoverview API route handlers for job applications collection operations.
 * Provides endpoints for retrieving paginated applications with filtering/searching,
 * and creating new applications. Includes comprehensive query parameters support,
 * statistics calculation, and user authorization.
 * 
 * @author ejparnell
 * @since 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/database';
import { Application } from '@/models/application';
import { CreateApplicationData } from '@/types/applications';

/**
 * Retrieves a paginated list of job applications for the authenticated user.
 * Supports comprehensive filtering, searching, sorting, and includes application statistics.
 * All query parameters are optional and can be combined for advanced filtering.
 * 
 * @param request - The incoming HTTP request with optional query parameters
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): {
 *       applications: ApplicationObject[],
 *       total: number,
 *       page: number,
 *       limit: number,
 *       stats: {
 *         total: number,
 *         available: number,
 *         applied: number,
 *         interview: number,
 *         rejected: number,
 *         hidden: number,
 *         responseRate: number,
 *         interviewRate: number,
 *         topCompanies: Array<{company: string, count: number}>,
 *         topLocations: Array<{location: string, count: number}>,
 *         applicationsByMonth: Array<{month: string, count: number}>
 *       }
 *     }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On server error (500): { error: 'Failed to fetch applications' }
 * 
 * @throws {Error} Database connection or query errors are caught and handled
 * 
 * @example
 * ```
 * // Basic pagination
 * GET /api/applications?page=1&limit=20
 * 
 * // Filter by status (single or multiple)
 * GET /api/applications?status=applied
 * GET /api/applications?status=applied,interview
 * 
 * // Search across multiple fields
 * GET /api/applications?search=software engineer
 * 
 * // Filter by company and location
 * GET /api/applications?company=google&location=remote
 * 
 * // Date range filtering
 * GET /api/applications?startDate=2024-01-01&endDate=2024-12-31
 * GET /api/applications?appliedStartDate=2024-01-01&appliedEndDate=2024-12-31
 * 
 * // Sorting
 * GET /api/applications?sortField=company&sortOrder=asc
 * 
 * // Combined filtering
 * GET /api/applications?status=applied&company=tech&sortField=updatedAt&sortOrder=desc&page=2&limit=10
 * 
 * Response:
 * {
 *   "applications": [...],
 *   "total": 150,
 *   "page": 1,
 *   "limit": 10,
 *   "stats": {
 *     "total": 150,
 *     "applied": 45,
 *     "interview": 12,
 *     "rejected": 8,
 *     "responseRate": 44.4,
 *     "interviewRate": 26.7
 *   }
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Parse query parameters from request URL
    const { searchParams } = new URL(request.url);
    

    // Pagination parameters with defaults
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Base filter to ensure user only sees their own applications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = { userId: session.user.id };
    
    // Status filtering - supports single status or comma-separated multiple statuses
    const status = searchParams.get('status');
    if (status) {
      if (status.includes(',')) {
        filters.status = { $in: status.split(',') };
      } else {
        filters.status = status;
      }
    }

    // Company filtering with case-insensitive regex matching
    const company = searchParams.get('company');
    if (company) {
      filters.company = { $regex: company, $options: 'i' };
    }

    // Location filtering with case-insensitive regex matching
    const location = searchParams.get('location');
    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }
    
    // Global search across multiple fields (title, company, description)
    const search = searchParams.get('search');
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filtering for application date field
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = startDate;
      if (endDate) filters.date.$lte = endDate;
    }

    // Date range filtering for when application was actually applied to
    const appliedStartDate = searchParams.get('appliedStartDate');
    const appliedEndDate = searchParams.get('appliedEndDate');
    if (appliedStartDate || appliedEndDate) {
      filters.appliedAt = {};
      if (appliedStartDate) filters.appliedAt.$gte = new Date(appliedStartDate);
      if (appliedEndDate) filters.appliedAt.$lte = new Date(appliedEndDate);
    }

    // Sorting configuration with defaults
    const sortField = searchParams.get('sortField') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };
    
    // Execute parallel queries for applications, total count, and statistics
    const [applications, total, stats] = await Promise.all([
      Application.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filters),
      Application.getStats(session.user.id)
    ]);

    // Initialize formatted statistics object with default values
    const formattedStats = {
      total: 0,
      available: 0,
      applied: 0,
      interview: 0,
      rejected: 0,
      hidden: 0,
      responseRate: 0,
      interviewRate: 0,
      topCompanies: [] as Array<{ company: string; count: number }>,
      topLocations: [] as Array<{ location: string; count: number }>,
      applicationsByMonth: [] as Array<{ month: string; count: number }>,
    };
    
    // Define valid status fields for type safety
    const statusFields = ['available', 'applied', 'interview', 'rejected', 'hidden'] as const;
    
    // Process and format statistics from database aggregation
    stats.forEach((stat: { _id: string; count: number }) => {
      if (stat._id && statusFields.includes(stat._id as typeof statusFields[number])) {
        formattedStats[stat._id as typeof statusFields[number]] = stat.count;
        formattedStats.total += stat.count;
      }
    });
    
    // Calculate response and interview rates as percentages
    if (formattedStats.applied > 0) {
      formattedStats.responseRate = ((formattedStats.interview + formattedStats.rejected) / formattedStats.applied) * 100;
      formattedStats.interviewRate = (formattedStats.interview / formattedStats.applied) * 100;
    }
    
    return NextResponse.json({
      applications,
      total,
      page,
      limit,
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * Creates a new job application for the authenticated user.
 * Validates required fields, generates application metadata, and sets up status flags.
 * Automatically sets appliedAt timestamp if status is 'applied'.
 * 
 * @param request - The incoming HTTP request with JSON body containing application data
 * 
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - On success (200): { success: true, application: CreatedApplicationObject }
 *   - On unauthorized (401): { error: 'Unauthorized' }
 *   - On validation error (400): { error: 'Missing required fields: title, company, jobUrl' }
 *   - On server error (500): { error: 'Failed to create application' }
 * 
 * @throws {Error} JSON parsing, validation, or database errors are caught and handled
 * 
 * @example
 * ```
 * POST /api/applications
 * Authorization: Bearer <session-token>
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "title": "Senior Software Engineer",
 *   "company": "Example Corp",
 *   "jobUrl": "https://example.com/jobs/123",
 *   "status": "applied",
 *   "location": "Remote",
 *   "salary": "$120,000 - $150,000",
 *   "description": "We are looking for...",
 *   "notes": "Looks like a great opportunity"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "application": {
 *     "_id": "generated-id",
 *     "id": 1640995200000,
 *     "userId": "user123",
 *     "title": "Senior Software Engineer",
 *     "company": "Example Corp",
 *     "status": "applied",
 *     "date": "2024-01-01",
 *     "dateLoaded": "2024-01-01T12:00:00.000Z",
 *     "appliedAt": "2024-01-01T12:00:00.000Z",
 *     "flags": {
 *       "applied": true,
 *       "hidden": false,
 *       "interview": false,
 *       "rejected": false
 *     }
 *   }
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

    // Connect to database
    await dbConnect();

    // Parse and validate request body
    const data: CreateApplicationData = await request.json();
    
    // Validate required fields
    if (!data.title || !data.company || !data.jobUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, jobUrl' },
        { status: 400 }
      );
    }
    
    // Prepare application data with metadata and user association
    const applicationData = {
      ...data,
      id: Date.now(), // Generate unique timestamp ID
      userId: session.user.id, // Associate with authenticated user
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      dateLoaded: new Date().toISOString(), // Full timestamp when loaded
      flags: {
        // Set status flags based on current status
        applied: data.status === 'applied',
        hidden: data.status === 'hidden',
        interview: data.status === 'interview',
        rejected: data.status === 'rejected',
      },
      // Set appliedAt timestamp only if status is 'applied'
      appliedAt: data.status === 'applied' ? new Date() : undefined,
    };
    
    // Create new application in database
    const newApplication = await Application.create(applicationData);
    
    return NextResponse.json({
      success: true,
      application: newApplication
    });

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
