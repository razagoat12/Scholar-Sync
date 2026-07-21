/**
 * GET /api/scholarships/stats
 * 
 * Get analytics and statistics about scholarships
 * 
 * Response includes:
 * - Total count
 * - Breakdown by field
 * - Breakdown by education level
 * - Breakdown by country
 * - Data refresh timestamp
 */

import { NextResponse } from 'next/server';
import { getOpportunitiesStats } from '@/services/opportunityService';

export async function GET() {
  try {
    const stats = await getOpportunitiesStats();

    return NextResponse.json({
      success: true,
      data: {
        total: stats.total,
        byField: stats.byField,
        byLevel: stats.byLevel,
        byCountry: stats.byCountry,
        summary: {
          fieldsCount: Object.keys(stats.byField).length,
          levelsCount: Object.keys(stats.byLevel).length,
          countriesCount: Object.keys(stats.byCountry).length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
