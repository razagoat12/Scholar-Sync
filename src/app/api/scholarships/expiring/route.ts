/**
 * GET /api/scholarships/expiring
 * 
 * Get scholarships expiring within a specified number of days
 * 
 * Query Parameters:
 * - days: Number of days to look ahead (default: 14)
 * - limit: Number of results (default: 20)
 * 
 * Examples:
 * GET /api/scholarships/expiring
 * GET /api/scholarships/expiring?days=7&limit=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { getExpiringOpportunities } from '@/services/opportunityService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = Math.max(parseInt(searchParams.get('days') || '14'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const expiring = await getExpiringOpportunities(days);
    const limited = expiring.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limited,
      meta: {
        total: limited.length,
        daysAhead: days,
        message: `Scholarships expiring within ${days} days`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching expiring scholarships:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch expiring scholarships',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
