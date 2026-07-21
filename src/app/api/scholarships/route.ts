/**
 * GET /api/scholarships
 * 
 * Get scholarships with optional filtering and pagination
 * 
 * Query Parameters:
 * - field: Filter by academic field (string)
 * - level: Filter by education level (string)
 * - country: Filter by country (string)
 * - limit: Number of results (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 * 
 * Examples:
 * GET /api/scholarships
 * GET /api/scholarships?field=Engineering&level=Undergraduate
 * GET /api/scholarships?country=USA&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllOpportunities,
  getOpportunitiesByField,
  getOpportunitiesByLevel,
  getOpportunitiesByCountry,
} from '@/services/opportunityService';
import { Opportunity } from '@/types/opportunity';

interface FilterParams {
  field?: string;
  level?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

/**
 * Parse and validate query parameters
 */
function parseParams(request: NextRequest): FilterParams {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    field: searchParams.get('field') || undefined,
    level: searchParams.get('level') || undefined,
    country: searchParams.get('country') || undefined,
    limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100),
    offset: Math.max(parseInt(searchParams.get('offset') || '0'), 0),
  };
}

/**
 * Apply filters to scholarships
 */
function applyFilters(scholarships: Opportunity[], params: FilterParams): Opportunity[] {
  let filtered = scholarships;

  if (params.field) {
    filtered = filtered.filter((s) => s.academic_field === params.field);
  }

  if (params.level) {
    filtered = filtered.filter((s) => s.education_level === params.level);
  }

  if (params.country) {
    filtered = filtered.filter((s) => s.country === params.country);
  }

  return filtered;
}

/**
 * Apply pagination
 */
function paginate(
  scholarships: Opportunity[],
  limit: number,
  offset: number
): { items: Opportunity[]; total: number; hasMore: boolean } {
  const total = scholarships.length;
  const items = scholarships.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return { items, total, hasMore };
}

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseParams(request);

    // Fetch scholarships
    let scholarships: Opportunity[] = [];

    if (params.field) {
      scholarships = await getOpportunitiesByField(params.field);
    } else if (params.level) {
      scholarships = await getOpportunitiesByLevel(params.level);
    } else if (params.country) {
      scholarships = await getOpportunitiesByCountry(params.country);
    } else {
      scholarships = await getAllOpportunities();
    }

    // Apply filters (in case multiple params)
    const filtered = applyFilters(scholarships, params);

    // Apply pagination
    const { items, total, hasMore } = paginate(
      filtered,
      params.limit || 50,
      params.offset || 0
    );

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        limit: params.limit || 50,
        offset: params.offset || 0,
        hasMore,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching scholarships:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scholarships',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
