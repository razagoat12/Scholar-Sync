'use client';

import { useState, useEffect } from 'react';
import OpportunityCard from '@/components/OpportunityCard';
import FilterPanel from '@/components/FilterPanel';
import { getAllOpportunities } from '@/services/opportunityService';
import { Opportunity } from '@/types/opportunity';

export default function BrowsePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllOpportunities();
        setOpportunities(data);
        setFilteredOpportunities(data);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let filtered = opportunities;

    if (selectedField) {
      filtered = filtered.filter((opp) => opp.academic_field === selectedField);
    }

    if (selectedLevel) {
      filtered = filtered.filter((opp) => opp.education_level === selectedLevel);
    }

    setFilteredOpportunities(filtered);
  }, [selectedField, selectedLevel, opportunities]);

  // Extract unique values for dropdowns
  const uniqueFields = Array.from(new Set(opportunities.map((opp) => opp.academic_field))).sort();
  const uniqueLevels = Array.from(new Set(opportunities.map((opp) => opp.education_level))).sort();

  const handleReset = () => {
    setSelectedField('');
    setSelectedLevel('');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Opportunities</h1>
          <p className="text-gray-600">
            Discover scholarships and competitions tailored to your interests
          </p>
        </div>

        {/* Filters */}
        {!loading && (
          <FilterPanel
            academicFields={uniqueFields}
            educationLevels={uniqueLevels}
            selectedField={selectedField}
            selectedLevel={selectedLevel}
            onFieldChange={setSelectedField}
            onLevelChange={setSelectedLevel}
            onReset={handleReset}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && filteredOpportunities.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              {opportunities.length === 0
                ? 'No opportunities available at the moment.'
                : 'No opportunities match your filters. Try adjusting them.'}
            </p>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && filteredOpportunities.length > 0 && (
          <div>
            <p className="text-gray-600 mb-6">
              Showing {filteredOpportunities.length} of {opportunities.length} opportunities
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
