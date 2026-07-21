# Filtering System Architecture

## Overview

ScholarSync features an advanced, composable filtering system that enables powerful scholarship discovery without overwhelming the user. The filtering logic is:

- **Composable**: Multiple filters combine elegantly (AND logic within categories, OR logic within values)
- **Performance-optimized**: Filtering happens server-side for speed
- **User-friendly**: Clear active filter display, no matching results guidance
- **Extensible**: Easy to add new filter types

---

## Filtering Logic Design

### Filter Combination Strategy

```
Filters are combined with the following logic:

1. Within same category (Field, Level, Country): OR logic
   - "Engineering OR Business" → Shows scholarships in either field
   
2. Across categories: AND logic
   - "Field: Engineering" AND "Level: Graduate" AND "Deadline: 7 days"
   
3. Search query: AND with all other filters
   - Search "AI" AND "Field: Engineering" → Searches within field

Example combinations:
✅ "Engineering" + "USA" + "Within 7 days" 
   → Find Engineering scholarships in USA closing soon
   
✅ "Search: AI" + "Graduate" + "Within 30 days"
   → Find graduate AI scholarships closing within a month
```

### Implementation: `/api/scholarships/search`

**Backend endpoint** handles all filtering logic:

```typescript
// src/lib/filters.ts
export function filterScholarships(
  scholarships: Opportunity[],
  criteria: FilterCriteria
): { results: Opportunity[]; stats: FilterStats }

// Applies filters:
// 1. Field (any of selected fields OR'd together)
// 2. Level (any of selected levels OR'd together)
// 3. Country (any of selected countries OR'd together)
// 4. Deadline proximity (exclude closed, within N days)
// 5. Search query (in title, description, provider)
```

---

## Available Filters

### 1. **Search Query** 🔍

- **What it searches**: Title, description, provider name
- **Case-insensitive**: "AI" matches "artificial intelligence"
- **Partial matches**: "tech" matches "technology"
- **Combined with**: All other filters (AND logic)

**Usage:**
```
GET /api/scholarships/search?q=engineering
GET /api/scholarships/search?q=AI&fields=Computer%20Science
```

### 2. **Academic Field** 📚

- **Values**: Dynamically loaded from data
- **Examples**: Engineering, Business, Medicine, Computer Science
- **Logic**: OR between multiple fields
- **Combined with**: Other category filters (AND)

**Usage:**
```
GET /api/scholarships/search?fields=Engineering,Business
GET /api/scholarships/search?fields=Engineering&levels=Graduate
```

### 3. **Education Level** 🎓

- **Values**: Undergraduate, Graduate, PhD, High School
- **Logic**: OR between multiple levels
- **Combined with**: Other category filters (AND)

**Usage:**
```
GET /api/scholarships/search?levels=Graduate,PhD
```

### 4. **Country** 🌍

- **Values**: Dynamically loaded from data
- **Examples**: USA, UK, International, Germany
- **Logic**: OR between multiple countries
- **Combined with**: Other category filters (AND)

**Usage:**
```
GET /api/scholarships/search?countries=USA,UK,International
```

### 5. **Deadline Proximity** ⏰

- **Purpose**: Find scholarships closing soon
- **Options**:
  - 7 days (this week)
  - 30 days (this month)
  - 60 days (within 2 months)
- **Behavior**: Excludes already-closed scholarships
- **Only one**: Can select only 1 deadline window

**Usage:**
```
GET /api/scholarships/search?deadlineWithinDays=7
GET /api/scholarships/search?deadlineWithinDays=30&fields=Engineering
```

---

## Filter Edge Cases & Handling

| Scenario | Behavior | User Sees |
|----------|----------|-----------|
| **No matches** | Returns empty array | "No opportunities match your filters" with clear next steps |
| **All filters cleared** | Returns all scholarships | "All scholarships" message |
| **Invalid filter combo** | Returns 0 results | Suggestion to adjust filters |
| **Closed deadlines** | Auto-excluded when deadline filter applied | Only open opportunities shown |
| **Future API sources** | Auto-populates with new data | Filter options expand dynamically |

**Example: No matches handling**
```typescript
if (response.data.length === 0) {
  // Display helpful message
  if (totalActiveFilters > 0) {
    return "No opportunities match your filters. Try adjusting them."
  }
  return "No opportunities available."
}
```

---

## Frontend Implementation

### Component: Enhanced FilterPanel

**Location**: `src/components/FilterPanel.tsx`

**Features**:
- **Collapsible**: Save space on page
- **Active filters display**: Shows selected filters as chips/tags with X to remove
- **Multi-select checkboxes**: Select multiple fields/levels/countries
- **Filter counts**: Shows how many opportunities in each category
- **Radio buttons**: Deadline proximity (only one at a time)
- **Search input**: Real-time search

**Props**:
```typescript
interface EnhancedFilterPanelProps {
  // Available options
  academicFields: string[];
  educationLevels: string[];
  countries: string[];
  
  // Selected values (multi-select)
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
}
```

### State Management

**Location**: `src/app/browse/page.tsx`

```typescript
// Individual filter states
const [searchQuery, setSearchQuery] = useState('');
const [selectedFields, setSelectedFields] = useState<string[]>([]);
const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
const [deadlineWithinDays, setDeadlineWithinDays] = useState<number | undefined>();

// Track total for UI
const totalActiveFilters = ...;

// Debounced search
useEffect(() => {
  const timeoutId = setTimeout(performSearch, 300);
  return () => clearTimeout(timeoutId);
}, [all filter dependencies]);
```

---

## API Design

### Endpoint: `GET /api/scholarships/search`

**Purpose**: Universal search/filter endpoint

**Query Parameters**:
```
q: string               - Search query (optional)
fields: string          - Comma-separated fields (optional)
levels: string          - Comma-separated levels (optional)
countries: string       - Comma-separated countries (optional)
deadlineWithinDays: int - Days until deadline (optional)
limit: int              - Results per page (default: 50, max: 100)
offset: int             - Pagination offset (default: 0)
```

**Response**:
```typescript
{
  success: boolean;
  data: Scholarship[];
  filters: {
    applied: {
      appliedFilters: number;        // How many filters are active
      matchingResults: number;        // Results after filtering
      totalResults: number;           // Total available
      filterDescription: string;      // Human-readable description
    };
    suggestions: {
      fields: { value: string; count: number }[];
      levels: { value: string; count: number }[];
      countries: { value: string; count: number }[];
    };
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}
```

**Examples**:

```bash
# Search all scholarships
curl "http://localhost:3000/api/scholarships/search"

# Filter by field
curl "http://localhost:3000/api/scholarships/search?fields=Engineering"

# Multiple filters
curl "http://localhost:3000/api/scholarships/search?fields=Engineering&levels=Graduate&deadlineWithinDays=30"

# Search within filters
curl "http://localhost:3000/api/scholarships/search?q=AI&fields=Computer%20Science&deadlineWithinDays=14"
```

---

## Filtering Utilities

### Location: `src/lib/filters.ts`

**Key Functions**:

```typescript
// Core filtering
filterScholarships(scholarships, criteria)  // Apply all filters
  → { results, stats }

// Deadline helpers
isDeadlineWithinDays(deadline, days)       // Check if within window
isDeadlinePassed(deadline)                 // Check if closed
getDaysUntilDeadline(deadline)             // Get exact days
getDeadlineStatus(deadline)                // Human-readable status
  → "Closes in 5 days", "Closes tomorrow", "Closed", etc.

// Filter suggestions
getFilterSuggestions(scholarships)         // Get counts by category
  → { fields, levels, countries }

// Formatting
formatCount(num)                           // 1234 → "1.2K"
```

**Example Usage**:
```typescript
import { filterScholarships, getDaysUntilDeadline } from '@/lib/filters';

const criteria = {
  fields: ['Engineering', 'Business'],
  levels: ['Graduate'],
  deadlineWithinDays: 30,
  searchQuery: 'AI'
};

const { results, stats } = filterScholarships(allScholarships, criteria);
// stats: {
//   appliedFilters: 4,
//   matchingResults: 12,
//   totalResults: 150,
//   filterDescription: "Fields: Engineering, Business • Levels: Graduate • ..."
// }

results.forEach(s => {
  console.log(`${s.title} closes in ${getDaysUntilDeadline(s.deadline)} days`);
});
```

---

## Performance Considerations

### Server-Side Filtering ✅

Why benefits:
- Bandwidth: Only send matching results
- Speed: Filter entire database quickly
- Consistency: Same logic everywhere
- Scalability: Can add pagination, caching

### Caching Strategy

```typescript
// Future enhancement: Cache popular filter combinations
const cache = new Map();
const cacheKey = JSON.stringify(criteria);

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

// Expensive operation
const results = filterScholarships(data, criteria);
cache.set(cacheKey, results);
```

### Pagination

```typescript
// Only send necessary data
const limit = Math.min(params.limit, 100);  // Max 100 per page
const offset = params.offset;
const items = filtered.slice(offset, offset + limit);
```

---

## Future Enhancements

- [ ] **Saved filters**: Let users bookmark filter combinations
- [ ] **Filter presets**: "Best for me", "Closing soon", "Only international"
- [ ] **Advanced search**: Boolean operators (AND, OR, NOT)
- [ ] **Range filters**: Min/max scholarship amount, deadline date range
- [ ] **Fuzzy search**: Handle typos ("Enginnering" → "Engineering")
- [ ] **Filter analytics**: Track popular filter combinations
- [ ] **Performance**: Add caching, compression, CDN

---

## Testing Filtering Logic

```typescript
// Test composable filters
test('AND logic across categories', () => {
  const results = filterScholarships(data, {
    fields: ['Engineering'],
    levels: ['Graduate'],
    countries: ['USA']
  });
  expect(results.filter(s => 
    s.academic_field === 'Engineering' &&
    s.education_level === 'Graduate' &&
    s.country === 'USA'
  )).toEqual(results);
});

// Test OR logic within category
test('OR logic within field selection', () => {
  const results = filterScholarships(data, {
    fields: ['Engineering', 'Business']
  });
  expect(results.every(s => 
    s.academic_field === 'Engineering' || s.academic_field === 'Business'
  )).toBe(true);
});

// Test no matches
test('handles no matches gracefully', () => {
  const results = filterScholarships(data, {
    countries: ['Atlantis'],
    deadlineWithinDays: 1
  });
  expect(results.length).toBe(0);
});

// Test deadline filtering
test('excludes closed deadlines', () => {
  const results = filterScholarships(data, {
    deadlineWithinDays: 30
  });
  expect(results.every(s => !isDeadlinePassed(s.deadline))).toBe(true);
});
```

---

**Status**: ✅ Production Ready

The filtering system is designed to scale, with clean separation between frontend UI and backend logic. Filters are composable, performant, and user-friendly.
