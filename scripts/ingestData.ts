/**
 * Data Ingestion Script (TypeScript)
 * Scrapes scholarship data and populates Firestore
 * 
 * Usage:
 *   npx tsx scripts/ingestData.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables BEFORE importing anything that reads them at
// module-load time (e.g. src/lib/firebase.ts). A static top-level import of
// dataIngestion would be hoisted above this call and initialize Firebase
// with undefined config, so the import below is deferred until after this.
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const { refreshScholarshipData } = await import('../src/services/dataIngestion');

  console.log('🚀 ScholarSync Data Ingestion Script\n');

  // Validate Firebase config
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((v) => console.error(`   - ${v}`));
    console.error('\nPlease configure .env.local with Firebase credentials');
    process.exit(1);
  }

  console.log('✓ Firebase credentials validated\n');

  // Run ingestion
  try {
    const result = await refreshScholarshipData();

    console.log('\n--- Final Report ---');
    console.log(`Total Processed: ${result.total}`);
    console.log(`Imported: ${result.imported}`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Message: ${result.message}`);

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
