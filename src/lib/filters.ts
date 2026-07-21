/**
 * Filtering Utilities
 * 
 * Clean, composable filtering logic for scholarships
 * Handles complex filter combinations elegantly
 */

import { Opportunity } from '@/types/opportunity';

export interface FilterCriteria {
  fields?: string[];
  levels?: string[];
  countries?: string[];
  deadlineWithinDays?: number;
  searchQuery?: string;
}

export interface FilterStats {
  appliedFilters: number;
  matchingResults: number;
  totalResults: number;
  filterDescription: string;
}

/**
 * Check if deadline is within N days
 */
export function isDeadlineWithinDays(deadline: string, days: number): boolean {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilDeadline > 0 && daysUntilDeadline <= days;
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Get human-readable deadline status
 */
export function getDeadlineStatus(deadline: string): string {
  if (isDeadlinePassed(deadline)) {
    return 'Closed';
  }
  
  const daysLeft = getDaysUntilDeadline(deadline);
  
  if (daysLeft <= 0) return 'Closing soon';
  if (daysLeft === 1) return 'Closes tomorrow';
  if (daysLeft <= 7) return `Closes in ${daysLeft} days`;
  if (daysLeft <= 30) return `Closes in ~${Math.ceil(daysLeft / 7)} weeks`;
  
  return 'Open';
}

/**
 * Apply filters to scholarship array
 * Returns filtered results and statistics
 */
export function filterScholarships(
  scholarships: Opportunity[],
  criteria: FilterCriteria
): { results: Opportunity[]; stats: FilterStats } {
  let filtered = [...scholarships];

  // Track which filters are being applied
  const activeFilters: string[] = [];

  // Filter by academic field (OR logic - any field match)
  if (criteria.fields && criteria.fields.length > 0) {
    filtered = filtered.filter((s) => criteria.fields!.includes(s.academic_field));
    activeFilters.push(`Fields: ${criteria.fields.join(', ')}`);
  }

  // Filter by education level (OR logic - any level match)
  if (criteria.levels && criteria.levels.length > 0) {
    filtered = filtered.filter((s) => criteria.levels!.includes(s.education_level));
    activeFilters.push(`Levels: ${criteria.levels.join(', ')}`);
  }

  // Filter by country (OR logic - any country match)
  if (criteria.countries && criteria.countries.length > 0) {
    filtered = filtered.filter((s) => criteria.countries!.includes(s.country));
    activeFilters.push(`Countries: ${criteria.countries.join(', ')}`);
  }

  // Filter by deadline proximity (exclude closed scholarships)
  if (criteria.deadlineWithinDays !== undefined) {
    filtered = filtered.filter((s) => {
      if (isDeadlinePassed(s.deadline)) return false;
      return isDeadlineWithinDays(s.deadline, criteria.deadlineWithinDays!);
    });
    activeFilters.push(`Deadline within ${criteria.deadlineWithinDays} days`);
  }

  // Search in title, description, provider
  if (criteria.searchQuery && criteria.searchQuery.trim()) {
    const query = criteria.searchQuery.toLowerCase().trim();
    filtered = filtered.filter((s) => {
      return (
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.provider.toLowerCase().includes(query)
      );
    });
    activeFilters.push(`Search: "${criteria.searchQuery}"`);
  }

  // Generate human-readable filter description
  let filterDescription = 'All scholarships';
  if (activeFilters.length > 0) {
    filterDescription = activeFilters.join(' • ');
  }

  const stats: FilterStats = {
    appliedFilters: activeFilters.length,
    matchingResults: filtered.length,
    totalResults: scholarships.length,
    filterDescription,
  };

  return { results: filtered, stats };
}

/**
 * Get filter suggestions based on current results
 */
export function getFilterSuggestions(
  scholarships: Opportunity[]
): {
  fields: { value: string; count: number }[];
  levels: { value: string; count: number }[];
  countries: { value: string; count: number }[];
} {
  const countBy = (arr: string[]): Record<string, number> =>
    arr.reduce(
      (acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  const fields = Object.entries(countBy(scholarships.map((s) => s.academic_field)))
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  const levels = Object.entries(countBy(scholarships.map((s) => s.education_level)))
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  const countries = Object.entries(countBy(scholarships.map((s) => s.country)))
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  return { fields, levels, countries };
}

/**
 * Format large numbers (e.g., 1.2K, 2.5M)
 */
export function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
