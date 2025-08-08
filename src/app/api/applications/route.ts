import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/database';
import { Application } from '@/models/application';
import { CreateApplicationData } from '@/types/applications';

// GET /api/applications - Get applications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build filter object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = { userId: session.user.id };
    
    // Status filter
    const status = searchParams.get('status');
    if (status) {
      if (status.includes(',')) {
        filters.status = { $in: status.split(',') };
      } else {
        filters.status = status;
      }
    }
    
    // Company filter
    const company = searchParams.get('company');
    if (company) {
      filters.company = { $regex: company, $options: 'i' };
    }
    
    // Location filter
    const location = searchParams.get('location');
    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }
    
    // Search filter (title, company, description)
    const search = searchParams.get('search');
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = startDate;
      if (endDate) filters.date.$lte = endDate;
    }
    
    // Applied date range filter
    const appliedStartDate = searchParams.get('appliedStartDate');
    const appliedEndDate = searchParams.get('appliedEndDate');
    if (appliedStartDate || appliedEndDate) {
      filters.appliedAt = {};
      if (appliedStartDate) filters.appliedAt.$gte = new Date(appliedStartDate);
      if (appliedEndDate) filters.appliedAt.$lte = new Date(appliedEndDate);
    }
    
    // Build sort object
    const sortField = searchParams.get('sortField') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };
    
    // Execute queries
    const [applications, total, stats] = await Promise.all([
      Application.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filters),
      Application.getStats(session.user.id)
    ]);
    
    // Format stats
    const formattedStats = {
      total: 0,
      available: 0,
      applied: 0,
      interview: 0,
      rejected: 0,
      hidden: 0,
      responseRate: 0,
      interviewRate: 0,
    };
    
    stats.forEach((stat: { _id: string; count: number }) => {
      formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
      formattedStats.total += stat.count;
    });
    
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

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data: CreateApplicationData = await request.json();
    
    // Validate required fields
    if (!data.title || !data.company || !data.jobUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, jobUrl' },
        { status: 400 }
      );
    }
    
    // Generate unique ID (timestamp-based for manual entries)
    const applicationData = {
      ...data,
      id: Date.now(), // Simple ID for manual entries
      userId: session.user.id,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      dateLoaded: new Date().toISOString(),
      flags: {
        applied: data.status === 'applied',
        hidden: data.status === 'hidden',
        interview: data.status === 'interview',
        rejected: data.status === 'rejected',
      },
      appliedAt: data.status === 'applied' ? new Date() : undefined,
    };
    
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
