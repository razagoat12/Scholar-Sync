# ScholarSync Data Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your Firebase credentials:
nano .env.local  # or use your editor

# Required fields:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... (see .env.example for all fields)
```

### 3. First Data Sync
```bash
# Scrape and populate Firestore
npm run ingest-data

# Expected output:
# 🚀 Starting scholarship data ingestion...
# 📥 Fetching data from sources...
# ✓ Fetched 150+ scholarships
# 💾 Writing to Firestore...
# ✓ Successfully imported 142 scholarships
```

### 4. Start Development Server
```bash
npm run dev

# Visit: http://localhost:3000/browse
```

---

## What's Been Built

### ✅ Data Pipeline
- **Source**: Multiple scholarship APIs + fallback seed data
- **Processing**: Normalization, deduplication, validation
- **Storage**: Firebase Firestore (real-time database)
- **Serving**: TypeScript service layer with query functions

### ✅ Data Sources
- Scholarships.com API (Global)
- MastersPortal API (EU Scholarships)
- Erasmus Mundus API (EU Grants)
- Seed Data (Fallback)

### ✅ Data Operations
```typescript
// Get all scholarships
getAllOpportunities()

// Filter by subject
getOpportunitiesByField("Engineering")

// Filter by education level
getOpportunitiesByLevel("Graduate")

// Filter by country
getOpportunitiesByCountry("USA")

// Get scholarships expiring soon
getExpiringOpportunities(14)  // next 14 days

// Get analytics
getOpportunitiesStats()
```

### ✅ Admin Features
- Manual data refresh via CLI: `npm run ingest-data`
- HTTP API endpoint: `POST /api/admin/refresh-data`
- Automatic error handling & fallbacks
- Detailed logging and statistics

---

## Data Lifecycle at a Glance

```
1. SCRAPE
   └─→ Fetch from APIs (Scholarships.com, MastersPortal, etc.)

2. CLEAN
   └─→ Normalize fields (title, country, field, etc.)
   └─→ Validate data (check required fields)
   └─→ Remove duplicates

3. VALIDATE
   └─→ Check deadline format
   └─→ Verify URLs
   └─→ Ensure core fields exist

4. STORE
   └─→ Write batch of 100+ docs to Firestore
   └─→ Single source of truth

5. SERVE
   └─→ Frontend queries via opportunityService
   └─→ Real-time updates
   └─→ Full-text search ready
```

---

## File Structure

```
scholarsync/
├── src/
│   ├── services/
│   │   ├── opportunityService.ts      ← Query API (all functions)
│   │   ├── scholarshipScraper.ts      ← Data extraction from sources
│   │   └── dataIngestion.ts           ← Pipeline orchestration
│   │
│   ├── app/
│   │   ├── browse/page.tsx            ← Uses opportunityService
│   │   └── api/admin/refresh-data/    ← Manual refresh endpoint
│   │
│   ├── types/
│   │   └── opportunity.ts             ← Data schema
│   │
│   └── lib/
│       └── firebase.ts                ← Firebase config
│
├── scripts/
│   └── ingestData.ts                  ← CLI tool to run data sync
│
├── DATA_ARCHITECTURE.md               ← Complete tech docs
├── SETUP_GUIDE.md                     ← This file
├── .env.example                       ← Config template
└── package.json                       ← Updated with new scripts
```

---

## Common Tasks

### 🔄 Refresh Data Weekly
```bash
# Manual refresh
npm run ingest-data

# Setup cron to run automatically (see DATA_ARCHITECTURE.md)
```

### 📊 Check Data Stats
```bash
# In browse page, you can see breakdown by:
# - Academic Field
# - Education Level
# - Country
```

### 🔍 Query Data Programmatically
```typescript
import { getOpportunitiesByField } from '@/services/opportunityService';

// In your component or page:
const engineeringScholarships = await getOpportunitiesByField('Engineering');
```

### 🚀 Deploy with Data
```bash
# Build
npm run build

# The database persists in Firebase, no need to redeploy data
npm run start
```

### ❌ Debug Data Issues
```bash
# 1. Check Firestore in Firebase Console
#    https://console.firebase.google.com
#    Database → Collections → opportunities

# 2. Run ingest with detailed output
npm run ingest-data

# 3. Check .env.local credentials
cat .env.local | grep FIREBASE
```

---

## Scaling Up

### Add More Scholarship Sources
Edit `scholarshipScraper.ts`:
```typescript
export async function scrapeYourNewSource(): Promise<RawScholarshipData[]> {
  // Fetch from your_api.com
  // Map to RawScholarshipData format
  // Return array
}

// Add to getAllScholarshipData():
export async function getAllScholarshipData(): Promise<RawScholarshipData[]> {
  const sources = await Promise.allSettled([
    scrapeScholarshipsComData(),
    scrapeMastersPortalData(),
    scrapeErasmusMundusData(),
    scrapeYourNewSource(),  // ← Add here
  ]);
  // ...
}
```

### Handle 1000+ Scholarships
- Firestore handles unlimited docs ✅
- Add pagination: `query(..., limit(50))`
- Implement caching for repeated queries
- Use batch writes (max 500/batch)

---

## API Endpoints Reference

### Query Data (Frontend)
```typescript
import { getAllOpportunities, getOpportunitiesByField } from '@/services/opportunityService';

const all = await getAllOpportunities();
const eng = await getOpportunitiesByField('Engineering');
const stats = await getOpportunitiesStats();
```

### Admin: Manual Refresh (Backend)
```bash
# Trigger via API
curl -X POST http://localhost:3000/api/admin/refresh-data \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"

# Response:
# {
#   "success": true,
#   "message": "Successfully ingested 142 scholarships",
#   "stats": {
#     "total": 150,
#     "imported": 142,
#     "errors": 8
#   }
# }
```

---

## Next Steps

1. ✅ **Data is now live!** Run `npm run dev` and visit `/browse`

2. **Optional: Setup auto-refresh**
   - Use Firebase Cloud Scheduler
   - Or deploy with Vercel Cron: Set cron in `vercel.json`
   - Run `npm run ingest-data` daily

3. **Optional: Monitor data quality**
   - Check `getOpportunitiesStats()` regularly
   - Set up alerts for:
     - Sudden drop in scholarship count
     - High validation error rate
     - API source failures

4. **Ready for production?**
   - All data lives in Firestore (secured by rules)
   - Scraper runs safely in isolated Node context
   - Admin API protected by ADMIN_API_KEY

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` |
| Firebase connection error | Check `.env.local` credentials |
| No scholarships imported | Check API sources are accessible |
| Build fails | Ensure TypeScript types are correct |
| Data doesn't update | Check `npm run ingest-data` completed successfully |

---

## Architecture Decisions

| Aspect | Choice | Why |
|--------|--------|-----|
| Database | **Firestore** | Real-time, scales easily, Firebase integration |
| Scraping | **Multiple APIs** | More reliable than single source |
| Data Refresh | **CLI + Endpoint** | Flexibility: manual or automated |
| Storage Format | **No JSON files** | Firestore for consistency & queryability |
| Validation | **Strict** | Only valid scholarships → better UX |

---

For detailed technical architecture, see [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md)
