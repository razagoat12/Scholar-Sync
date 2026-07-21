'use client';

import { useState } from 'react';

export interface EnhancedFilterPanelProps {
  academicFields: string[];
  educationLevels: string[];
  countries: string[];
  
  // Selected filters
  selectedFields: string[];
  selectedLevels: string[];
  selectedCountries: string[];
  deadlineWithinDays?: number;
  searchQuery?: string;
  
  // Callbacks
  onFieldChange: (fields: string[]) => void;
  onLevelChange: (levels: string[]) => void;
  onCountryChange: (countries: string[]) => void;
  onDeadlineChange: (days: number | undefined) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  
  // Optional: Show filter counts
  filterCounts?: {
    fields: Record<string, number>;
    levels: Record<string, number>;
    countries: Record<string, number>;
  };
}

export default function FilterPanel({
  academicFields,
  educationLevels,
  countries,
  selectedFields,
  selectedLevels,
  selectedCountries,
  deadlineWithinDays,
  searchQuery,
  onFieldChange,
  onLevelChange,
  onCountryChange,
  onDeadlineChange,
  onSearchChange,
  onReset,
  filterCounts,
}: EnhancedFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const handleFieldToggle = (field: string) => {
    const updated = selectedFields.includes(field)
      ? selectedFields.filter((f) => f !== field)
      : [...selectedFields, field];
    onFieldChange(updated);
  };

  const handleLevelToggle = (level: string) => {
    const updated = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    onLevelChange(updated);
  };

  const handleCountryToggle = (country: string) => {
    const updated = selectedCountries.includes(country)
      ? selectedCountries.filter((c) => c !== country)
      : [...selectedCountries, country];
    onCountryChange(updated);
  };

  const totalActiveFilters =
    selectedFields.length +
    selectedLevels.length +
    selectedCountries.length +
    (deadlineWithinDays ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-white border border-warm-peach rounded-2xl mb-8 shadow-md">
      {/* Filter Header */}
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-cream-light transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h2 className="text-xl font-bold text-warm-brown">🔍 Refine Your Search</h2>
          {totalActiveFilters > 0 && (
            <p className="text-sm text-warm-orange mt-1 font-medium">
              ✨ {totalActiveFilters} filter{totalActiveFilters !== 1 ? 's' : ''} active
            </p>
          )}
        </div>
        <button
          className={`text-warm-brown transition-transform duration-300 text-xl ${expanded ? 'rotate-180' : ''}`}
          type="button"
        >
          ▼
        </button>
      </div>

      {/* Active Filters (Sticky tags) */}
      {totalActiveFilters > 0 && (
        <div className="border-t border-warm-peach px-6 py-3 bg-warm-orange bg-opacity-10 flex flex-wrap gap-2">
          {searchQuery && (
            <div className="inline-flex items-center gap-2 bg-warm-orange bg-opacity-25 text-warm-orange px-3 py-1 rounded-full text-sm font-medium border border-warm-orange border-opacity-40">
              🔍 {searchQuery}
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-warm-terracotta font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}
          
          {selectedFields.map((field) => (
            <div
              key={field}
              className="inline-flex items-center gap-2 bg-warm-orange bg-opacity-25 text-warm-orange px-3 py-1 rounded-full text-sm font-medium border border-warm-orange border-opacity-40"
            >
              📚 {field}
              <button
                onClick={() => handleFieldToggle(field)}
                className="hover:text-warm-terracotta font-bold ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          
          {selectedLevels.map((level) => (
            <div
              key={level}
              className="inline-flex items-center gap-2 bg-warm-gold bg-opacity-25 text-warm-brown px-3 py-1 rounded-full text-sm font-medium border border-warm-gold border-opacity-40"
            >
              🎓 {level}
              <button
                onClick={() => handleLevelToggle(level)}
                className="hover:text-warm-terracotta font-bold ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          
          {selectedCountries.map((country) => (
            <div
              key={country}
              className="inline-flex items-center gap-2 bg-warm-terracotta bg-opacity-25 text-warm-terracotta px-3 py-1 rounded-full text-sm font-medium border border-warm-terracotta border-opacity-40"
            >
              🌍 {country}
              <button
                onClick={() => handleCountryToggle(country)}
                className="hover:text-warm-orange font-bold ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          
          {deadlineWithinDays && (
            <div className="inline-flex items-center gap-2 bg-warm-brown bg-opacity-15 text-warm-brown px-3 py-1 rounded-full text-sm font-medium border border-warm-brown border-opacity-30">
              ⏰ Within {deadlineWithinDays} days
              <button
                onClick={() => onDeadlineChange(undefined)}
                className="hover:text-warm-orange font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {totalActiveFilters > 0 && (
            <button
              onClick={onReset}
              className="text-warm-terracotta hover:text-warm-orange text-sm font-bold ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Filter Options (Expandable) */}
      {expanded && (
        <div className="border-t border-warm-peach p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-warm-brown mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, field, or provider..."
              className="w-full px-4 py-2 border border-warm-peach rounded-lg focus:ring-2 focus:ring-warm-orange focus:border-warm-orange outline-none transition bg-cream-light text-warm-brown placeholder-warm-brown placeholder-opacity-40"
            />
          </div>

          {/* Academic Fields */}
          <div>
            <label className="block text-sm font-bold text-warm-brown mb-3">
              📚 Academic Field
            </label>
            <div className="grid grid-cols-2 gap-3">
              {academicFields.map((field) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                    className="w-4 h-4 rounded border-warm-orange accent-warm-orange cursor-pointer"
                  />
                  <span className="text-sm text-warm-brown">
                    {field}
                    {filterCounts?.fields?.[field] && (
                      <span className="text-warm-brown text-opacity-60 ml-1">({filterCounts.fields[field]})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-sm font-bold text-warm-brown mb-3">
              🎓 Education Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {educationLevels.map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => handleLevelToggle(level)}
                    className="w-4 h-4 rounded border-warm-gold accent-warm-gold cursor-pointer"
                  />
                  <span className="text-sm text-warm-brown">
                    {level}
                    {filterCounts?.levels?.[level] && (
                      <span className="text-warm-brown text-opacity-60 ml-1">({filterCounts.levels[level]})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="block text-sm font-bold text-warm-brown mb-3">
              🌍 Country
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
              {countries.map((country) => (
                <label key={country} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country)}
                    onChange={() => handleCountryToggle(country)}
                    className="w-4 h-4 rounded border-warm-terracotta accent-warm-terracotta cursor-pointer"
                  />
                  <span className="text-sm text-warm-brown">
                    {country}
                    {filterCounts?.countries?.[country] && (
                      <span className="text-warm-brown text-opacity-60 ml-1">({filterCounts.countries[country]})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Deadline Proximity */}
          <div>
            <label className="block text-sm font-bold text-warm-brown mb-3">
              ⏰ Deadline Proximity
            </label>
            <div className="space-y-2">
              {[
                { label: 'This week (7 days)', value: 7 },
                { label: 'This month (30 days)', value: 30 },
                { label: 'Within 60 days', value: 60 },
                { label: 'No deadline filter', value: undefined },
              ].map(({ label, value }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                  <input
                    type="radio"
                    name="deadline"
                    checked={deadlineWithinDays === value}
                    onChange={() => onDeadlineChange(value)}
                    className="w-4 h-4 border-warm-brown accent-warm-brown cursor-pointer"
                  />
                  <span className="text-sm text-warm-brown">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-warm-peach">
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-gradient-to-r from-warm-orange to-warm-gold hover:shadow-lg text-white font-bold rounded-lg transition-all duration-300"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
