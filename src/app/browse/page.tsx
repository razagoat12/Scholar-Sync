'use client';

import { useState, useEffect } from 'react';
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
          
          // Build filter counts from suggestions
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

          // Update available options from current results
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

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
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
    <main className="min-h-screen bg-gradient-to-br from-cream via-cream-light to-warm-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header with decorative elements */}
        <div className="mb-16 text-center relative">
          {/* Decorative shapes */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-warm-orange to-transparent opacity-10 rounded-full blur-3xl"></div>
          
          <h1 className="text-5xl font-bold text-warm-brown mb-3 relative z-10">
            ✨ Discover Your Perfect Scholarship
          </h1>
          <p className="text-warm-brown text-opacity-75 text-xl max-w-2xl mx-auto relative z-10">
            Explore thousands of scholarships tailored to your dreams and ambitions
          </p>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
            <div className="w-12 h-1 bg-gradient-to-r from-warm-orange to-transparent rounded-full"></div>
            <span className="text-2xl">🎓</span>
            <div className="w-12 h-1 bg-gradient-to-l from-warm-orange to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Recommended Section (when no filters applied) */}
        {totalActiveFilters === 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <span className="text-4xl animate-float">⭐</span>
              <h2 className="text-3xl font-bold text-warm-brown">Recommended For You</h2>
              <span className="text-2xl animate-bounce">💡</span>
              {recommendedLoading && (
                <span className="text-sm text-warm-brown text-opacity-60 animate-pulse">Loading...</span>
              )}
            </div>
            
            {!recommendedLoading && recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommended.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="relative group"
                  >
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-warm-gold to-warm-orange text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl group-hover:shadow-2xl transition-all">
                      ✨ Recommended
                    </div>
                    <OpportunityCard opportunity={opportunity} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-warm-brown text-opacity-60 text-center py-12">
                No recommendations available right now
              </div>
            )}
            
            <div className="mt-12 border-t border-warm-orange border-opacity-30 pt-12"></div>
          </div>
        )}

        {/* Enhanced Filter Panel */}
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

        {/* Loading State - Enhanced */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-warm-orange border-opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-warm-orange border-r-warm-orange animate-spin"></div>
            </div>
            <p className="text-warm-brown text-opacity-75 font-bold text-lg">Finding scholarships for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-warm-terracotta bg-opacity-15 border-l-4 border-warm-terracotta rounded-xl p-8 mb-8 shadow-md">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="text-warm-terracotta font-bold text-lg">Error loading scholarships</p>
                <p className="text-warm-brown text-opacity-75 text-base mt-2">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && scholarships.length === 0 && (
          <div className="text-center py-24 bg-white bg-opacity-60 backdrop-blur-sm border-2 border-dashed border-warm-orange border-opacity-40 rounded-2xl shadow-md">
            <span className="text-7xl block mb-4">🔍</span>
            <p className="text-warm-brown text-2xl mb-3 font-bold">
              No scholarships match your search
            </p>
            <p className="text-warm-brown text-opacity-70 mb-10 text-lg">
              Try adjusting your filters or clear them to see all opportunities
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-warm-orange to-warm-gold text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg text-lg"
            >
              🔄 Clear All Filters
            </button>
            <p className="text-warm-brown text-opacity-60 text-sm mt-8">
              Currently filtering: <span className="font-semibold text-warm-brown">{filterDescription}</span>
            </p>
          </div>
        )}

        {/* Results Header with Sorting */}
        {!loading && !error && scholarships.length > 0 && (
          <div className="mb-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-md p-8 border border-warm-peach">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
              <div>
                <p className="text-warm-brown font-bold text-xl">
                  Found <span className="text-warm-orange text-2xl">{scholarships.length}</span> of{' '}
                  <span className="text-warm-orange text-2xl">{totalCount}</span> opportunities
                </p>
                <p className="text-warm-brown text-opacity-70 text-base mt-2">
                  {totalActiveFilters > 0 ? (
                    <>
                      ✓ Filters: <span className="font-semibold text-warm-brown">{filterDescription}</span>
                    </>
                  ) : (
                    'Showing all available opportunities'
                  )}
                </p>
              </div>
              
              {/* Sorting Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-base font-bold text-warm-brown">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border-2 border-warm-peach rounded-lg text-sm font-medium bg-cream-light text-warm-brown hover:border-warm-orange focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-warm-orange cursor-pointer shadow-sm"
                >
                  <option value="relevance">🎯 Relevance</option>
                  <option value="deadline">⏰ Deadline (Urgent First)</option>
                  <option value="newest">✨ Newest</option>
                  <option value="featured">⭐ Featured</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && scholarships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
            {scholarships.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
