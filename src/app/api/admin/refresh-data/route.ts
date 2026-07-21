/**
 * Admin API: Refresh Scholarship Data
 * 
 * POST /api/admin/refresh-data
 * 
 * Requires:
 * - Authorization header with admin key
 * 
 * Usage:
 * curl -X POST http://localhost:3000/api/admin/refresh-data \
 *   -H "Authorization: Bearer YOUR_ADMIN_KEY" \
 *   -H "Content-Type: application/json"
 */

import { refreshScholarshipData } from '@/services/dataIngestion';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handler for manual data refresh
 */
export async function POST(request: NextRequest) {
  try {
    // Simple admin key check (replace with proper auth in production)
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) {
      return NextResponse.json(
        { error: 'Admin API not configured' },
        { status: 503 }
      );
    }

    if (!authHeader || !authHeader.includes(adminKey)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] Starting manual data refresh...');

    // Run the refresh
    const result = await refreshScholarshipData();

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        stats: {
          total: result.total,
          imported: result.imported,
          errors: result.errors,
        },
        timestamp: new Date().toISOString(),
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('[API] Error refreshing data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/admin/refresh-data',
    requiresAuth: true,
    description: 'Refresh scholarship data from sources',
  });
}
