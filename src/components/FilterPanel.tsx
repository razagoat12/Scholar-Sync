'use client';

import { useState } from 'react';
import { Search, BookOpen, GraduationCap, Globe2, Clock, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

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
    <div className="bg-surface border border-border rounded-2xl mb-8">
      {/* Filter Header */}
      <button
        type="button"
        className="w-full p-6 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer rounded-2xl"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-muted" strokeWidth={2} />
          <div className="text-left">
            <h2 className="font-display text-lg font-semibold text-ink">Refine Your Search</h2>
            {totalActiveFilters > 0 && (
              <p className="text-sm text-lime mt-0.5 font-medium">
                {totalActiveFilters} filter{totalActiveFilters !== 1 ? 's' : ''} active
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {/* Active Filters */}
      {totalActiveFilters > 0 && (
        <div className="border-t border-border px-6 py-3 flex flex-wrap items-center gap-2">
          {searchQuery && (
            <FilterChip label={searchQuery} onRemove={() => onSearchChange('')} />
          )}
          {selectedFields.map((field) => (
            <FilterChip key={field} label={field} onRemove={() => handleFieldToggle(field)} />
          ))}
          {selectedLevels.map((level) => (
            <FilterChip key={level} label={level} onRemove={() => handleLevelToggle(level)} />
          ))}
          {selectedCountries.map((country) => (
            <FilterChip key={country} label={country} onRemove={() => handleCountryToggle(country)} />
          ))}
          {deadlineWithinDays && (
            <FilterChip
              label={`Within ${deadlineWithinDays} days`}
              onRemove={() => onDeadlineChange(undefined)}
            />
          )}
          <button
            onClick={onReset}
            className="text-muted hover:text-ink text-sm font-medium ml-auto cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Options */}
      {expanded && (
        <div className="border-t border-border p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
              <Search className="w-4 h-4" strokeWidth={2} />
              Search
            </label>
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, field, or provider..."
              className="w-full px-4 py-2.5 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-lime focus:border-lime outline-none transition text-ink placeholder-muted"
            />
          </div>

          <FilterGroup
            icon={<BookOpen className="w-4 h-4" strokeWidth={2} />}
            label="Academic Field"
            items={academicFields}
            selected={selectedFields}
            counts={filterCounts?.fields}
            onToggle={handleFieldToggle}
          />

          <FilterGroup
            icon={<GraduationCap className="w-4 h-4" strokeWidth={2} />}
            label="Education Level"
            items={educationLevels}
            selected={selectedLevels}
            counts={filterCounts?.levels}
            onToggle={handleLevelToggle}
          />

          <FilterGroup
            icon={<Globe2 className="w-4 h-4" strokeWidth={2} />}
            label="Country"
            items={countries}
            selected={selectedCountries}
            counts={filterCounts?.countries}
            onToggle={handleCountryToggle}
            scrollable
          />

          {/* Deadline Proximity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
              <Clock className="w-4 h-4" strokeWidth={2} />
              Deadline Proximity
            </label>
            <div className="space-y-2">
              {[
                { label: 'This week (7 days)', value: 7 },
                { label: 'This month (30 days)', value: 30 },
                { label: 'Within 60 days', value: 60 },
                { label: 'No deadline filter', value: undefined },
              ].map(({ label, value }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="deadline"
                    checked={deadlineWithinDays === value}
                    onChange={() => onDeadlineChange(value)}
                    className="w-4 h-4 accent-lime cursor-pointer"
                  />
                  <span className="text-sm text-muted group-hover:text-ink transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-lime hover:bg-lime-400 text-base font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-lime-dim text-lime px-3 py-1 rounded-full text-sm font-medium border border-lime/30">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:text-ink cursor-pointer">
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function FilterGroup({
  icon,
  label,
  items,
  selected,
  counts,
  onToggle,
  scrollable,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  selected: string[];
  counts?: Record<string, number>;
  onToggle: (item: string) => void;
  scrollable?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
        {icon}
        {label}
      </label>
      <div className={`grid grid-cols-2 gap-3 ${scrollable ? 'max-h-48 overflow-y-auto pr-2' : ''}`}>
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="w-4 h-4 rounded accent-lime cursor-pointer"
            />
            <span className="text-sm text-muted group-hover:text-ink transition-colors">
              {item}
              {counts?.[item] && <span className="text-muted/70 ml-1">({counts[item]})</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
