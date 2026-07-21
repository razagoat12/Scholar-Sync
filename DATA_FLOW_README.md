# ScholarSync: Data-Driven Scholarship Platform ✨

A modern Next.js application that connects students with scholarship opportunities through a **robust, scalable data pipeline**.

## 🎯 What's New: Data-Driven Architecture

✅ **Fixed Issue #1** - Implemented complete data lifecycle:

- **📥 Data Sources**: Multiple APIs (Scholarships.com, MastersPortal, Erasmus Mundus)
- **🧹 Data Processing**: Automated cleaning, normalization, deduplication
- **💾 Data Storage**: Firebase Firestore (single source of truth)
- **🔍 Data Queries**: 6+ query functions for flexible data retrieval
- **🔄 Refresh Mechanism**: CLI tool + Admin API endpoint

---

## 🚀 Quick Start

### 1. Setup
```bash
git clone <repo>
cd scholarsync

npm install

# Configure Firebase
cp .env.example .env.local
nano .env.local  # Add your Firebase credentials
```

### 2. Populate Data
```bash
# Scrape scholarships from sources and populate Firestore
npm run ingest-data

# Output:
# 🚀 Starting scholarship data ingestion...
# ✓ Fetched 150 scholarships from sources
# ✓ Validated 142 scholarships (8 rejected)
# ✓ Successfully imported 142 scholarships
```

### 3. Run Application
```bash
npm run dev

# Visit: http://localhost:3000/browse
```

---

## 📊 Architecture Overview

### Data Pipeline Flow
```
Scholarship Sources
    ↓
Scraper (scholarshipScraper.ts)
    ↓
Clean & Validate (dataIngestion.ts)
    ↓
Firebase Firestore
    ↓
Service Layer (opportunityService.ts)
    ↓
React Components (BrowsePage, FilterPanel)
```

### Data Sources
- **Scholarships.com API** - Global scholarship database
- **MastersPortal API** - European master's scholarships
- **Erasmus Mundus API** - EU funded opportunities
- **Seed Data** - Fallback (always available)

### Supported Queries
```typescript
// All scholarships
getAllOpportunities()

// By subject
getOpportunitiesByField("Engineering")

// By education level
getOpportunitiesByLevel("Graduate")

// By location
getOpportunitiesByCountry("USA")

// Expiring soon
getExpiringOpportunities(14)

// Analytics
getOpportunitiesStats()
```

---

## 📁 Project Structure

```
scholarsync/
├── src/
│   ├── services/
│   │   ├── scholarshipScraper.ts    # Extract from APIs
│   │   ├── dataIngestion.ts         # Pipeline orchestration
│   │   └── opportunityService.ts    # Query API (6+ functions)
│   ├── types/
│   │   └── opportunity.ts           # Data schema
│   ├── lib/
│   │   └── firebase.ts              # Firebase config
│   └── app/
│       ├── browse/page.tsx          # Browse scholarships
│       └── api/admin/refresh-data/  # Manual refresh endpoint
│
├── scripts/
│   └── ingestData.ts                # CLI to run data sync
│
├── docs/
│   ├── DATA_ARCHITECTURE.md         # Technical deep dive
│   ├── SETUP_GUIDE.md               # Getting started
│   └── DEPLOYMENT_GUIDE.md          # Production deployment
│
└── .env.example                     # Config template
```

---

## 🔄 Data Refresh Options

### Option A: CLI (Manual)
```bash
npm run ingest-data
```

### Option B: API Endpoint (Manual)
```bash
curl -X POST http://localhost:3000/api/admin/refresh-data \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

### Option C: Scheduled (Automatic)
- **Vercel**: Set `vercel.json` with cron schedule
- **Firebase**: Cloud Functions with Pub/Sub trigger
- **GitHub Actions**: Workflow on schedule
- **AWS Lambda**: EventBridge trigger

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for setup instructions.

---

## 📊 Data Schema

```typescript
interface Opportunity {
  id: string                    // Unique ID
  title: string                 // Scholarship name
  provider: string              // Organization
  country: string               // Target country/region
  academic_field: string        // Subject area
  education_level: string       // Undergrad/Grad/PhD
  deadline: string              // YYYY-MM-DD
  description: string           // Details
  application_link: string      // Apply URL
  createdAt: timestamp           // Auto-generated
  updatedAt: timestamp           // Auto-generated
  source: string                // "automated-scraper"
}
```

---

## ✨ Key Features

### ✅ Data Quality
- Automatic deduplication
- Field normalization
- URL validation
- Deadline checking
- Error recovery with fallback data

### ✅ Scalability
- Unlimited Firestore documents
- Batch processing (500 writes/batch)
- Multiple data sources
- Incremental updates ready
- Handles 100+ scholarships easily

### ✅ Developer Experience
- Type-safe queries (TypeScript)
- Comprehensive error handling
- Detailed logging
- CLI tools included
- Well documented

### ✅ Production Ready
- Environment variable management
- Admin API with authentication
- Scheduled refresh capability
- Monitoring & alerts ready
- Security best practices

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md) | Technical deep dive into data lifecycle |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Quick start & development guide |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment & automation |

---

## 🛠 Environment Setup

### Required Variables (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
ADMIN_API_KEY=your_secure_key
```

Get Firebase values from: [Firebase Console](https://console.firebase.google.com)

---

## 📈 Metrics & Monitoring

### Data Quality Checks
```typescript
const stats = await getOpportunitiesStats();
// {
//   total: 142,
//   byField: { "Engineering": 25, "Business": 18, ... },
//   byLevel: { "Undergraduate": 60, "Graduate": 82 },
//   byCountry: { "USA": 35, "UK": 28, ... },
//   lastUpdated: "2026-03-27T10:30:00Z"
// }
```

### Ingest Status
Logged during `npm run ingest-data`:
- Total scholarships fetched
- Validated & imported count
- Errors & rejections
- Performance metrics

---

## 🔐 Security

✅ **Firebase Firestore Rules** (enable in Console):
```
read: if request.auth != null;
write: if hasAdminToken();
```

✅ **API Authentication:**
- Admin endpoint requires `ADMIN_API_KEY` header
- Both stored in environment variables

✅ **Data Privacy:**
- No personal user data in seed data
- All URLs verified before storage
- Error logs don't expose credentials

---

## 🚀 Deployment

### Quick Deploy to Vercel
```bash
vercel deploy

# Set environment variables in Vercel dashboard
# Configure cron for auto-refresh (see DEPLOYMENT_GUIDE.md)
```

### Other Options
- Firebase Hosting
- AWS Amplify
- Netlify
- Self-hosted

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| No data after setup | Run `npm run ingest-data` |
| Firebase errors | Check `.env.local` credentials |
| Build fails | Run `npm install` |
| Scholarships not updating | Check scheduled job logs |
| API 401 errors | Verify `ADMIN_API_KEY` environment variable |

---

## 🎯 What This Solves

### Before (Issue #1): Static/Manual Data
❌ Hardcoded scholarship list
❌ Manual updates needed
❌ Doesn't scale past 10 scholarships
❌ No data refresh mechanism

### After: Data-Driven Pipeline
✅ Automated data extraction from multiple sources
✅ Automatic deduplication & validation
✅ Single source of truth (Firestore)
✅ Scalable to 100+ scholarships
✅ Built-in refresh mechanisms
✅ Production-ready deployment

---

## 📦 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Data Pipeline**: Node.js, Axios
- **Deployment**: Vercel (recommended)

---

## 🤝 Contributing

To add more scholarship sources:

1. Edit `src/services/scholarshipScraper.ts`
2. Add new `scrapeXxxData()` function
3. Include in `getAllScholarshipData()` pipeline
4. Test with `npm run ingest-data`

---

## 📞 Support

- **Setup Issues**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Technical Details**: See [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md)
- **Deployment Help**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Firebase Docs**: https://firebase.google.com/docs

---

## 📄 License

MIT

---

**Ready to launch?** Start with `npm run ingest-data` 🚀
