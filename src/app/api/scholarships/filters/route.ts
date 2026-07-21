/**
 * GET /api/scholarships/filters
 * 
 * Get available filter options (academic fields, education levels, countries)
 * Used to populate filter dropdowns in UI
 * 
 * Response:
 * {
 *   academicFields: ["Engineering", "Business", ...],
 *   educationLevels: ["Undergraduate", "Graduate", ...],
 *   countries: ["USA", "UK", "International", ...]
 * }
 */

import { NextResponse } from 'next/server';
import { getOpportunitiesStats } from '@/services/opportunityService';

export async function GET() {
  try {
    const stats = await getOpportunitiesStats();

    return NextResponse.json({
      success: true,
      data: {
        academicFields: Object.keys(stats.byField).sort(),
        educationLevels: Object.keys(stats.byLevel).sort(),
        countries: Object.keys(stats.byCountry).sort(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching filters:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch filter options',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
