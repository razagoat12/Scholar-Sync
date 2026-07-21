# Deployment & Automation Guide

## Prerequisites
- ✅ Firebase project configured with Firestore
- ✅ Application running locally successfully
- ✅ Environment variables configured

---

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### A. Deploy Application
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables
# Add: NEXT_PUBLIC_FIREBASE_API_KEY, etc.
#      ADMIN_API_KEY
```

#### B. Setup Automatic Data Refresh
```bash
# Create vercel.json in project root:
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/admin/refresh-data",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs data refresh daily at 2 AM UTC.

#### C. Deploy
```bash
git add vercel.json
git commit -m "Add scheduled data refresh"
git push

# Vercel will auto-deploy and schedule the cron job
```

---

### Option 2: Firebase Hosting + Cloud Functions

#### A. Deploy Frontend
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

#### B. Setup Data Refresh with Cloud Functions

**functions/package.json:**
```json
{
  "dependencies": {
    "firebase-functions": "^4.0.0",
    "firebase-admin": "^11.0.0",
    "axios": "^1.4.0"
  }
}
```

**functions/src/refreshData.ts:**
```typescript
import * as functions from 'firebase-functions';
import { refreshScholarshipData } from '../../src/services/dataIngestion';

export const scheduledRefresh = functions.pubsub
  .schedule('0 2 * * *')  // 2 AM UTC daily
  .onRun(async (context) => {
    console.log('Starting scheduled data refresh');
    const result = await refreshScholarshipData();
    console.log('Data refresh complete:', result);
    return result;
  });
```

#### C. Deploy Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

---

### Option 3: AWS Lambda + EventBridge

#### A. Create Lambda Function
```bash
# Package your data ingestion code
npm run build

# Create deployment package
zip -r lambda-function.zip dist/ node_modules/ .env.local
```

**lambda-function.ts (handler):**
```typescript
export async function handler(event: any) {
  const result = await refreshScholarshipData();
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}
```

#### B. Configure EventBridge Rule
```
Rule: scholarship-refresh-daily
Pattern: Rate (1 day)
Target: Lambda function
```

---

### Option 4: GitHub Actions (Free CI/CD)

**.github/workflows/refresh-data.yml:**
```yaml
name: Daily Scholarship Data Refresh

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Allow manual trigger

jobs:
  refresh-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run data ingestion
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
        run: npm run ingest-data

      - name: Notify on success
        run: echo "✅ Data refresh completed successfully"
```

**Setup:**
1. Add Firebase secrets to GitHub: Settings → Secrets → Actions
2. Add workflow file to `.github/workflows/`
3. Commit and push

---

## Environment Variables for Production

### Vercel/.env.production
```env
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prod_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=prod_sender
NEXT_PUBLIC_FIREBASE_APP_ID=prod_app_id
ADMIN_API_KEY=strong_random_secret
```

### Sensitive Variables
Store in:
- **Vercel Dashboard** → Environment Variables
- **GitHub** → Secrets & variables → Actions
- **Firebase** → Project Settings

---

## Monitoring & Alerts

### Option A: Firebase Alerts
```
Firebase Console → Project Settings → Notifications
- Billing alerts
- Error rate alerts
```

### Option B: Simple Monitoring
Add POST to Discord/Slack webhook:

**api/admin/refresh-data/route.ts:**
```typescript
// After successful refresh:
if (result.success) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `✅ Scholarships synced: ${result.imported} imported, ${result.errors} errors`
    })
  });
}
```

---

## Troubleshooting Deployments

### Issue: "API Key not found"
```bash
# Ensure environment variables are set in deployment platform
# For Vercel: Check Settings → Environment Variables
# Variables must include NEXT_PUBLIC_ prefix for client-side access
```

### Issue: "Firestore quota exceeded"
```
Solution:
1. Firebase Console → Usage & Quota
2. Increase Firestore capacity
3. Reduce ingestion frequency (e.g., weekly instead of daily)
4. Enable auto-scaling
```

### Issue: "Jobs not running"
```bash
# Vercel: Check Functions → Logs
# GitHub: Check Actions tab for job status
# Firebase: Check Cloud Functions logs
```

---

## Security Best Practices

✅ **DO:**
- Store `ADMIN_API_KEY` in secrets manager
- Use environment-specific credentials
- Enable Firestore security rules
- Rotate API keys quarterly
- Monitor ingest logs for errors

❌ **DON'T:**
- Commit `.env.local` to git
- Use same credentials for prod/staging
- Expose `ADMIN_API_KEY` in frontend
- Log sensitive data

---

## Performance Tips

1. **Cache data locally** (5-15 min TTL)
2. **Lazy load** scholarship list
3. **Batch Firestore writes** (✅ Already implemented)
4. **Optimize images** before storing
5. **Use Firestore indexes** for complex queries

---

## Cost Estimation

| Component | Free Tier | Cost |
|-----------|-----------|------|
| Firestore | 50k reads/day | $0.06 per 100k reads |
| Hosting | 10GB/month | $0.18/GB |
| Functions | 2M calls/month | $0.40 per 1M calls |
| Bandwidth | 10GB/month | $0.15/GB |

**Example:** 1000 scholarships, 10k users/month = **~$5-10/month**

---

## Next Steps

1. Choose deployment platform (Vercel recommended)
2. Setup auto-refresh schedule
3. Configure monitoring/alerts
4. Test with manual trigger first
5. Monitor logs for 1 week
6. Adjust schedule/parameters as needed

For detailed architecture info: [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md)
