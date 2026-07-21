/**
 * GET /api/scholarships/recommended
 * 
 * Get recommended scholarships based on:
 * - Recently added
 * - Deadlines approaching soon
 * - Popular fields
 * 
 * Query Parameters:
 * - limit: Number of recommendations (default: 10)
 * - strategy: 'trending' | 'expiring' | 'random' (default: 'mixed')
 * 
 * Examples:
 * GET /api/scholarships/recommended
 * GET /api/scholarships/recommended?limit=5&strategy=expiring
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllOpportunities,
  getExpiringOpportunities,
} from '@/services/opportunityService';
import { Opportunity } from '@/types/opportunity';

type RecommendationStrategy = 'trending' | 'expiring' | 'random' | 'mixed';

/**
 * Get trending scholarships (by academic field popularity)
 */
function getTrendingScholarships(
  scholarships: Opportunity[],
  limit: number
): Opportunity[] {
  // Group by field and get from top fields
  const byField = scholarships.reduce(
    (acc, s) => {
      if (!acc[s.academic_field]) acc[s.academic_field] = [];
      acc[s.academic_field].push(s);
      return acc;
    },
    {} as Record<string, Opportunity[]>
  );

  // Sort fields by count
  const sortedFields = Object.entries(byField).sort((a, b) => b[1].length - a[1].length);

  // Pick from top fields
  const recommendations: Opportunity[] = [];
  for (const [, scholarships] of sortedFields) {
    recommendations.push(...scholarships);
    if (recommendations.length >= limit) break;
  }

  return recommendations.slice(0, limit);
}

/**
 * Get random scholarships
 */
function getRandomScholarships(
  scholarships: Opportunity[],
  limit: number
): Opportunity[] {
  const shuffled = [...scholarships].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * Mix different strategies
 */
function getMixedRecommendations(
  scholarships: Opportunity[],
  limit: number
): Opportunity[] {
  const expiringLimitInDays = 30;
  const expiring = scholarships.filter((s) => {
    const deadline = new Date(s.deadline);
    const now = new Date();
    const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= expiringLimitInDays;
  });

  const trending = getTrendingScholarships(scholarships, limit * 0.5);
  const random = getRandomScholarships(scholarships, limit * 0.5);

  // Combine and deduplicate by ID
  const combined = [...expiring, ...trending, ...random];
  const seen = new Set<string>();
  const unique: Opportunity[] = [];

  for (const s of combined) {
    if (!seen.has(s.id)) {
      unique.push(s);
      seen.add(s.id);
    }
  }

  return unique.slice(0, limit);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const strategy = (searchParams.get('strategy') || 'mixed') as RecommendationStrategy;

    const scholarships = await getAllOpportunities();

    let recommendations: Opportunity[] = [];

    switch (strategy) {
      case 'expiring':
        recommendations = await getExpiringOpportunities(30);
        recommendations = recommendations.slice(0, limit);
        break;

      case 'trending':
        recommendations = getTrendingScholarships(scholarships, limit);
        break;

      case 'random':
        recommendations = getRandomScholarships(scholarships, limit);
        break;

      case 'mixed':
      default:
        recommendations = getMixedRecommendations(scholarships, limit);
        break;
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      meta: {
        total: recommendations.length,
        strategy,
        message: `Recommended scholarships using ${strategy} strategy`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recommendations',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
