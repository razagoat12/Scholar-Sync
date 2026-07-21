# Data Architecture & Lifecycle Documentation

## Overview

ScholarSync uses a **data-driven pipeline** to source, clean, and serve scholarship data. This ensures:
- ✅ Always fresh data from multiple sources
- ✅ Scalability to 100+ scholarships without hardcoding
- ✅ Easy data refresh and updates
- ✅ Consistent data quality

---

## Data Lifecycle

```
SOURCE → SCRAPE → CLEAN → VALIDATE → STORE → SERVE
  ↓        ↓        ↓        ↓        ↓      ↓
APIs    Extract  Normalize  Check  Firestore API/UI
```

### Phase 1️⃣: Data Sources

**Primary Sources:**
- **Scholarships.com API** - Global scholarship database
- **MastersPortal** - European graduate scholarships  
- **Erasmus Mundus** - EU funded scholarships
- **Seed Data** - Fallback test data

**Extracted Fields:**
- `title` - Scholarship name
- `provider` - Organization offering it
- `country` - Target country/region
- `academic_field` - Subject area
- `education_level` - Undergrad/Grad/PhD
- `deadline` - Application deadline
- `description` - Details
- `application_link` - Apply URL

### Phase 2️⃣: Data Extraction & Cleaning

**Location:** `src/services/scholarshipScraper.ts`

**Processing:**
```typescript
// Extract from APIs
- Call scholarship APIs and parse responses
- Handle errors gracefully (fallback to next source)

// Normalize fields
- Standardize field names (e.g., "CS" → "Computer Science")
- Normalize education levels
- Format dates to YYYY-MM-DD
- Validate URLs

// Remove duplicates
- Use title-based deduplication
- Keep only valid entries with required fields
```

### Phase 3️⃣: Data Validation

**Requirements:**
- Title must exist
- Application link must be valid (not placeholder)
- Deadline must be a valid date
- No blank/null required fields

**Filtering Rules:**
- Remove entries with missing core fields
- Reject malformed URLs
- Reject past deadlines (optional)

### Phase 4️⃣: Data Storage

**Database:** Firebase Firestore

**Collection:** `opportunities`

**Schema:**
```json
{
  "id": "global-leaders-scholarship",
  "title": "Global Leaders Scholarship Program",
  "provider": "Global Scholarship Foundation",
  "description": "Competitive scholarship for exceptional students...",
  "country": "International",
  "academic_field": "Engineering",
  "education_level": "Undergraduate",
  "deadline": "2026-06-30",
  "application_link": "https://scholarshipfoundation.org/apply",
  "createdAt": 1711478400000,
  "updatedAt": 1711478400000,
  "source": "automated-scraper"
}
```

### Phase 5️⃣: Data Retrieval & Serving

**Service:** `src/services/opportunityService.ts`

**API Endpoints:**
```typescript
// Frontend queries
getAllOpportunities()                  // All scholarships
getOpportunitiesByField(field)        // Filter by subject
getOpportunitiesByLevel(level)        // Filter by education level
getOpportunitiesByCountry(country)    // Filter by location
getExpiringOpportunities(daysAhead)   // Urgent deadlines
getOpportunitiesStats()               // Analytics
```

---

## How to Refresh Data

### Option A: CLI Script (Recommended)

```bash
# Install dependencies
npm install

# Run data ingestion
npm run ingest-data

# Output:
# 🚀 Starting scholarship data ingestion...
# 📥 Fetching data from sources...
# ✓ Fetched 150 scholarships from sources
# 🧹 Cleaning and validating data...
# ✓ Validated 142 scholarships (8 rejected)
# 💾 Writing to Firestore...
# ✓ Successfully imported 142 scholarships
```

**Environment Setup:**
```bash
# .env.local must contain:
cp .env.example .env.local

# Then fill in your Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# etc.
```

### Option B: Admin API Endpoint

**Trigger manual refresh via API:**

```bash
curl -X POST http://localhost:3000/api/admin/refresh-data \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully ingested 142 scholarships",
  "stats": {
    "total": 150,
    "imported": 142,
    "errors": 8
  },
  "timestamp": "2026-03-27T10:30:00Z"
}
```

### Option C: Scheduled Jobs (Production)

**Using Cloud Scheduler (Firebase):**
```
Schedule: Daily at 2 AM UTC
Trigger: POST /api/admin/refresh-data
Auth: Admin API Key
```

**Using AWS Lambda / Vercel Cron:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/admin/refresh-data",
    "schedule": "0 2 * * *"
  }]
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────┐
│   Scholarship Sources          │
├─────────────────────────────────┤
│ • Scholarships.com API         │
│ • MastersPortal API            │
│ • Erasmus Mundus API           │
│ • Seed Data (Fallback)         │
└────────────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Scholarships   │
        │  Scraper        │
        │ (Extract Data)  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Clean & Filter │
        │ • Normalize     │
        │ • Deduplicate   │
        │ • Validate      │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Firestore DB   │
        │"opportunities"  │ ◄──── Single Source of Truth
        │ collection      │
        └────────┬────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
   Search    Browse      API
   Page      Page      Analytics
```

---

## Data Management

### Monitoring Data Quality

**Check data stats:**
```typescript
const stats = await getOpportunitiesStats();
console.log(stats);
// {
//   total: 142,
//   byField: { "Engineering": 25, "Business": 18, ... },
//   byLevel: { "Undergraduate": 60, "Graduate": 82 },
//   byCountry: { "USA": 35, "UK": 28, ... },
//   lastUpdated: "2026-03-27T10:30:00Z"
// }
```

### Manual Data Fix

**If data needs correction:**
```typescript
// Edit directly in Firestore Console:
// 1. Go to: Firebase Console → Firestore → opportunities
// 2. Find the document
// 3. Edit field values
// 4. Save
```

### Resync Data

```bash
# Clear old data and fully resync:
npm run ingest-data
```

---

## Configuration

### Environment Variables

**Required (.env.local):**
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Admin API (for refresh endpoint)
ADMIN_API_KEY=your-secure-admin-key-here
```

### API Timeouts

**Default scraper timeouts:** 10 seconds

To increase/decrease, edit in `scholarshipScraper.ts`:
```typescript
axios.get(url, {
  timeout: 10000  // milliseconds
})
```

---

## Scaling to 100+ Scholarships

✅ **Current Design Supports:**
- Unlimited Firestore documents
- Batch processing (up to 500 writes/batch)
- Automatic deduplication
- Multiple data sources
- Fallback mechanisms

✅ **To Scale Further:**
```typescript
// 1. Add more source APIs
export async function scrapeNewSourceData() { ... }

// 2. Increase batch size (if needed)
const batch = writeBatch(db);  // Max 500 writes/batch

// 3. Add caching
const cachedOpportunities = new Map();

// 4. Implement incremental updates
// Instead of full refresh, only add new scholarships
```

---

## Troubleshooting

### Issue: "No scholarships found"

**Solution:**
1. Check Firebase credentials in `.env.local`
2. Verify Firestore collection exists
3. Check API sources are accessible:
   ```bash
   curl https://api.scholarships.com/v1/opportunities
   ```
4. Run with verbose logging:
   ```typescript
   import * as fs from 'fs';
   fs.writeFileSync('ingest-log.txt', JSON.stringify(debug, null, 2));
   ```

### Issue: "Validation errors (X rejected)"

**Solution:**
1. Check `cleanAndValidateData()` requirements
2. Verify source data has required fields
3. Review error logs in console during ingest

### Issue: Firebase quota exceeded

**Solution:**
1. Increase Firestore capacity in Firebase Console
2. Reduce ingest frequency (e.g., once daily)
3. Implement incremental updates instead of full sync

---

## Future Enhancements

- [ ] Add more scholarship sources (Chevening, Fulbright API, etc.)
- [ ] Implement webscraping with Puppeteer for JS-heavy sites
- [ ] Add scheduled AWS Lambda functions
- [ ] User bookmarking/favorites (add `users` collection)
- [ ] Notification system for deadline alerts
- [ ] Machine learning personalization
- [ ] Multi-language support
- [ ] Cache layer (Redis) for performance

---

## Related Files

```
Project Root
├── src/services/
│   ├── scholarshipScraper.ts      # Data extraction
│   ├── dataIngestion.ts           # Pipeline orchestration
│   └── opportunityService.ts      # Data queries
├── src/app/api/admin/
│   └── refresh-data/route.ts      # Manual refresh endpoint
├── scripts/
│   ├── ingestData.ts              # TypeScript CLI
│   └── ingestData.js              # JS CLI wrapper
├── .env.example                   # Configuration template
└── README.md                      # This file
```

---

## Support & Questions

- **Firebase Docs:** https://firebase.google.com/docs/firestore
- **Scholarships.com API:** Check their API documentation
- **Validation Issues:** Check `scholarshipScraper.ts` normalization functions
