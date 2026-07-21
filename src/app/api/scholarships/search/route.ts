/**
 * GET /api/scholarships/search
 * 
 * Advanced search and filtering endpoint
 * 
 * Query Parameters:
 * - q: Search query (searches title, description, provider)
 * - fields: Comma-separated academic fields
 * - levels: Comma-separated education levels
 * - countries: Comma-separated countries
 * - deadlineWithinDays: Show only deadlines within N days
 * - sort: 'deadline' (urgent first), 'relevance' (search match quality), 'newest' (recently added), 'featured' (highlighted opportunities)
 * - limit: Results per page (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 * 
 * Examples:
 * GET /api/scholarships/search?q=engineering&sort=deadline
 * GET /api/scholarships/search?fields=Engineering,Computer%20Science&levels=Graduate&sort=relevance
 * GET /api/scholarships/search?countries=USA,UK&deadlineWithinDays=30&sort=deadline
 * GET /api/scholarships/search?q=tech&fields=Computer%20Science&sort=featured&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllOpportunities } from '@/services/opportunityService';
import { filterScholarships, getFilterSuggestions, type FilterCriteria } from '@/lib/filters';
import { Opportunity } from '@/types/opportunity';

interface SearchParams {
  q?: string;
  fields?: string[];
  levels?: string[];
  countries?: string[];
  deadlineWithinDays?: number;
  sort?: 'deadline' | 'relevance' | 'newest' | 'featured';
  limit: number;
  offset: number;
}

/**
 * Parse search query parameters
 */
function parseSearchParams(request: NextRequest): SearchParams {
  const searchParams = request.nextUrl.searchParams;

  const fields = searchParams.get('fields')?.split(',').filter(Boolean) || [];
  const levels = searchParams.get('levels')?.split(',').filter(Boolean) || [];
  const countries = searchParams.get('countries')?.split(',').filter(Boolean) || [];

  return {
    q: searchParams.get('q') || undefined,
    fields: fields.length > 0 ? fields : undefined,
    levels: levels.length > 0 ? levels : undefined,
    countries: countries.length > 0 ? countries : undefined,
    deadlineWithinDays: searchParams.get('deadlineWithinDays')
      ? parseInt(searchParams.get('deadlineWithinDays')!)
      : undefined,
    sort: (searchParams.get('sort') as 'deadline' | 'relevance' | 'newest' | 'featured' | null) || undefined,
    limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100),
    offset: Math.max(parseInt(searchParams.get('offset') || '0'), 0),
  };
}

/**
 * Sort scholarships by specified criteria
 */
function sortResults(
  results: Opportunity[],
  sortBy?: 'deadline' | 'relevance' | 'newest' | 'featured',
  searchQuery?: string
): Opportunity[] {
  if (!sortBy || sortBy === 'relevance') {
    // Default: relevance sorting based on search query
    if (!searchQuery) return results;
    
    const query = searchQuery.toLowerCase();
    return results.sort((a, b) => {
      // Title match scores higher
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      const aScore = aTitle.includes(query) ? 10 : 
                     (a.description?.toLowerCase().includes(query) ? 5 : 0) +
                     (a.tags?.some(t => t.toLowerCase().includes(query)) ? 3 : 0);
      const bScore = bTitle.includes(query) ? 10 : 
                     (b.description?.toLowerCase().includes(query) ? 5 : 0) +
                     (b.tags?.some(t => t.toLowerCase().includes(query)) ? 3 : 0);
      
      return bScore - aScore;
    });
  }
  
  if (sortBy === 'deadline') {
    // Sort by deadline (urgent first - closest deadline first)
    return results.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    });
  }
  
  if (sortBy === 'newest') {
    // Sort by createdAt (most recent first), fallback to deadline
    return results.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.deadline).getTime();
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.deadline).getTime();
      return dateB - dateA;
    });
  }
  
  if (sortBy === 'featured') {
    // Featured first, then by deadline
    return results.sort((a, b) => {
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    });
  }
  
  return results;
}

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseSearchParams(request);

    // Fetch all scholarships
    const allScholarships = await getAllOpportunities();

    // Build filter criteria
    const criteria: FilterCriteria = {
      fields: params.fields,
      levels: params.levels,
      countries: params.countries,
      deadlineWithinDays: params.deadlineWithinDays,
      searchQuery: params.q,
    };

    // Apply filters
    const { results: filtered, stats } = filterScholarships(allScholarships, criteria);

    // Apply sorting
    const sorted = sortResults(filtered, params.sort, params.q);

    // Apply pagination
    const total = sorted.length;
    const items = sorted.slice(params.offset, params.offset + params.limit);
    const hasMore = params.offset + params.limit < total;

    // Get filter suggestions based on results
    const suggestions = getFilterSuggestions(sorted);

    return NextResponse.json({
      success: true,
      data: items,
      filters: {
        applied: stats,
        suggestions: {
          fields: suggestions.fields.slice(0, 10), // Top 10
          levels: suggestions.levels,
          countries: suggestions.countries.slice(0, 10), // Top 10
        },
      },
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error searching scholarships:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search scholarships',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
