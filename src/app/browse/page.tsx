'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, SearchX, Sparkles } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import FilterPanel from '@/components/FilterPanel';
import { searchScholarships, fetchRecommended, type Scholarship } from '@/lib/api';

export default function BrowsePage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [recommended, setRecommended] = useState<Scholarship[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [deadlineWithinDays, setDeadlineWithinDays] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'deadline' | 'relevance' | 'newest' | 'featured'>('relevance');

  // Filter options
  const [academicFields, setAcademicFields] = useState<string[]>([]);
  const [educationLevels, setEducationLevels] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [filterCounts, setFilterCounts] = useState<any>(null);

  // Filter description
  const [filterDescription, setFilterDescription] = useState('All scholarships');

  // Load recommended scholarships on mount
  useEffect(() => {
    const loadRecommended = async () => {
      try {
        setRecommendedLoading(true);
        const response = await fetchRecommended({ limit: 6, strategy: 'mixed' });
        if (response.success && response.data) {
          setRecommended(response.data);
        }
      } catch (err) {
        console.error('Error loading recommended:', err);
      } finally {
        setRecommendedLoading(false);
      }
    };

    loadRecommended();
  }, []);

  // Perform search whenever filters change
  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await searchScholarships({
          q: searchQuery || undefined,
          fields: selectedFields.length > 0 ? selectedFields : undefined,
          levels: selectedLevels.length > 0 ? selectedLevels : undefined,
          countries: selectedCountries.length > 0 ? selectedCountries : undefined,
          deadlineWithinDays,
          sort: sortBy,
          limit: 100,
        });

        if (response.success) {
          setScholarships(response.data || []);
          setTotalCount(response.pagination?.total || 0);
          setFilterDescription(response.filters?.applied.filterDescription || 'All scholarships');

          if (response.filters?.suggestions) {
            setFilterCounts({
              fields: Object.fromEntries(
                response.filters.suggestions.fields.map((f) => [f.value, f.count])
              ),
              levels: Object.fromEntries(
                response.filters.suggestions.levels.map((l) => [l.value, l.count])
              ),
              countries: Object.fromEntries(
                response.filters.suggestions.countries.map((c) => [c.value, c.count])
              ),
            });
          }

          const uniqueFields = [
            ...new Set((response.data || []).map((s) => s.academic_field)),
          ].sort();
          const uniqueLevels = [
            ...new Set((response.data || []).map((s) => s.education_level)),
          ].sort();
          const uniqueCountries = [
            ...new Set((response.data || []).map((s) => s.country)),
          ].sort();

          setAcademicFields(uniqueFields);
          setEducationLevels(uniqueLevels);
          setCountries(uniqueCountries);
        } else {
          setError(response.error || 'Failed to load scholarships');
        }
      } catch (err) {
        console.error('Error searching scholarships:', err);
        setError('Failed to load scholarships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedFields,
    selectedLevels,
    selectedCountries,
    deadlineWithinDays,
    sortBy,
  ]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedFields([]);
    setSelectedLevels([]);
    setSelectedCountries([]);
    setDeadlineWithinDays(undefined);
    setSortBy('relevance');
  };

  const totalActiveFilters =
    (searchQuery ? 1 : 0) +
    selectedFields.length +
    selectedLevels.length +
    selectedCountries.length +
    (deadlineWithinDays ? 1 : 0);

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="mb-20 text-center">
          <h1 className="font-display text-6xl sm:text-7xl font-semibold tracking-tight text-ink mb-4">
            Find your next
            <br />
            <span className="text-lime">scholarship.</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Thousands of opportunities, filtered to match exactly what you&apos;re looking for.
          </p>
        </div>

        {/* Recommended Section */}
        {totalActiveFilters === 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-lime" strokeWidth={2} />
              <h2 className="font-display text-2xl font-semibold text-ink">Recommended For You</h2>
              {recommendedLoading && (
                <span className="text-sm text-muted animate-pulse">Loading...</span>
              )}
            </div>

            {!recommendedLoading && recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            ) : !recommendedLoading ? (
              <div className="text-muted text-center py-12">No recommendations available right now</div>
            ) : null}

            <div className="mt-16 border-t border-border"></div>
          </div>
        )}

        {/* Filter Panel */}
        <FilterPanel
          academicFields={academicFields}
          educationLevels={educationLevels}
          countries={countries}
          selectedFields={selectedFields}
          selectedLevels={selectedLevels}
          selectedCountries={selectedCountries}
          deadlineWithinDays={deadlineWithinDays}
          searchQuery={searchQuery}
          onFieldChange={setSelectedFields}
          onLevelChange={setSelectedLevels}
          onCountryChange={setSelectedCountries}
          onDeadlineChange={setDeadlineWithinDays}
          onSearchChange={setSearchQuery}
          onReset={handleReset}
          filterCounts={filterCounts}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-lime animate-spin mb-4" strokeWidth={2} />
            <p className="text-muted font-medium">Finding scholarships for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0" strokeWidth={2} />
              <div>
                <p className="text-danger font-semibold">Error loading scholarships</p>
                <p className="text-muted text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && scholarships.length === 0 && (
          <div className="text-center py-24 bg-surface border border-dashed border-border rounded-2xl">
            <SearchX className="w-12 h-12 text-muted mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-ink text-xl font-semibold mb-2">No scholarships match your search</p>
            <p className="text-muted mb-8">Try adjusting your filters or clear them to see all opportunities</p>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-6 py-3 bg-lime hover:bg-lime-400 text-base font-semibold rounded-xl transition-all cursor-pointer"
            >
              Clear All Filters
            </button>
            <p className="text-muted text-sm mt-6">
              Currently filtering: <span className="text-ink font-medium">{filterDescription}</span>
            </p>
          </div>
        )}

        {/* Results Header */}
        {!loading && !error && scholarships.length > 0 && (
          <div className="mb-8 bg-surface rounded-2xl p-6 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-ink font-semibold text-lg">
                  Found <span className="text-lime">{scholarships.length}</span> of{' '}
                  <span className="text-lime">{totalCount}</span> opportunities
                </p>
                <p className="text-muted text-sm mt-1">
                  {totalActiveFilters > 0 ? (
                    <>Filters: <span className="text-ink font-medium">{filterDescription}</span></>
                  ) : (
                    'Showing all available opportunities'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-lime cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="deadline">Deadline (Urgent First)</option>
                  <option value="newest">Newest</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && scholarships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {scholarships.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
