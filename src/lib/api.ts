/**
 * Frontend API Client
 * 
 * Provides type-safe functions for communicating with the backend
 * Frontend never touches Firestore directly - all through this API
 */

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  academic_field: string;
  education_level: string;
  deadline: string;
  description: string;
  application_link: string;
  
  // Enhanced optional fields
  funding_type?: 'Full Ride' | 'Partial' | 'Tuition' | 'Other' | string;
  amount?: number;
  currency?: string;
  tags?: string[];
  requirements?: string[];
  coverage?: string[];
  open_to_international?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}

export interface FiltersResponse {
  success: boolean;
  data: {
    academicFields: string[];
    educationLevels: string[];
    countries: string[];
  };
  timestamp: string;
}

export interface StatsResponse {
  success: boolean;
  data: {
    total: number;
    byField: Record<string, number>;
    byLevel: Record<string, number>;
    byCountry: Record<string, number>;
    summary: {
      fieldsCount: number;
      levelsCount: number;
      countriesCount: number;
    };
  };
  timestamp: string;
}

export interface FilterSuggestion {
  value: string;
  count: number;
}

export interface SearchResponse {
  success: boolean;
  data?: Scholarship[];
  error?: string;
  filters?: {
    applied: {
      appliedFilters: number;
      matchingResults: number;
      totalResults: number;
      filterDescription: string;
    };
    suggestions: {
      fields: FilterSuggestion[];
      levels: FilterSuggestion[];
      countries: FilterSuggestion[];
    };
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}

/**
 * Build query string from object
 */
function buildQueryString(params: Record<string, any>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

/**
 * Fetch all scholarships with optional filters
 */
export async function fetchScholarships(options?: {
  field?: string;
  level?: string;
  country?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<Scholarship>> {
  const qs = buildQueryString(options || {});
  const res = await fetch(`/api/scholarships${qs}`);
  if (!res.ok) throw new Error('Failed to fetch scholarships');
  return res.json();
}

/**
 * Fetch recommended scholarships
 */
export async function fetchRecommended(options?: {
  limit?: number;
  strategy?: 'trending' | 'expiring' | 'random' | 'mixed';
}): Promise<ApiResponse<Scholarship[]>> {
  const qs = buildQueryString(options || {});
  const res = await fetch(`/api/scholarships/recommended${qs}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

/**
 * Fetch expiring scholarships
 */
export async function fetchExpiring(options?: {
  days?: number;
  limit?: number;
}): Promise<ApiResponse<Scholarship[]>> {
  const qs = buildQueryString(options || {});
  const res = await fetch(`/api/scholarships/expiring${qs}`);
  if (!res.ok) throw new Error('Failed to fetch expiring scholarships');
  return res.json();
}

/**
 * Fetch available filter options
 */
export async function fetchFilters(): Promise<FiltersResponse> {
  const res = await fetch('/api/scholarships/filters');
  if (!res.ok) throw new Error('Failed to fetch filters');
  return res.json();
}

/**
 * Fetch statistics
 */
export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch('/api/scholarships/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

/**
 * Helper: Format filter combinations
 */
export function buildFilterParams(
  field?: string,
  level?: string,
  country?: string
): Record<string, string> {
  return {
    ...(field && { field }),
    ...(level && { level }),
    ...(country && { country }),
  };
}

/**
 * Advanced search with multiple filters
 */
export async function searchScholarships(options?: {
  q?: string;
  fields?: string[];
  levels?: string[];
  countries?: string[];
  deadlineWithinDays?: number;
  sort?: 'deadline' | 'relevance' | 'newest' | 'featured';
  limit?: number;
  offset?: number;
}): Promise<SearchResponse> {
  const params: Record<string, any> = {};

  if (options?.q) params.q = options.q;
  if (options?.fields?.length) params.fields = options.fields.join(',');
  if (options?.levels?.length) params.levels = options.levels.join(',');
  if (options?.countries?.length) params.countries = options.countries.join(',');
  if (options?.deadlineWithinDays) params.deadlineWithinDays = options.deadlineWithinDays;
  if (options?.sort) params.sort = options.sort;
  if (options?.limit) params.limit = options.limit;
  if (options?.offset) params.offset = options.offset;

  const qs = new URLSearchParams(params).toString();
  const url = `/api/scholarships/search${qs ? `?${qs}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search scholarships');
  return res.json();
}
