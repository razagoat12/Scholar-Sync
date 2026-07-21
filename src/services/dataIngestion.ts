/**
 * Data Ingestion Service
 * Handles scraping, cleaning, and storing scholarship data to Firestore
 */

import {
  collection,
  writeBatch,
  query,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAllScholarshipData, RawScholarshipData } from './scholarshipScraper';
import { Opportunity } from '../types/opportunity';

/**
 * Clean and validate scholarship data
 */
function cleanAndValidateData(raw: RawScholarshipData): Opportunity | null {
  // Validate required fields
  if (!raw.title?.trim()) return null;
  if (!raw.application_link || raw.application_link === '#') return null;

  // Remove duplicates/invalid entries
  const deadline = new Date(raw.deadline);
  if (isNaN(deadline.getTime())) return null;

  return {
    id: generateId(raw.title), // Will be overwritten by Firestore
    title: raw.title.trim(),
    provider: raw.provider?.trim() || 'Unknown',
    academic_field: raw.academic_field?.trim() || 'General',
    education_level: raw.education_level?.trim() || 'Undergraduate',
    country: raw.country?.trim() || 'International',
    deadline: raw.deadline,
    description: raw.description?.trim() || '',
    application_link: raw.application_link.trim(),
  };
}

/**
 * Generate unique ID for scholarship
 */
function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Clear old opportunities collection
 */
async function clearOldData(): Promise<number> {
  const q = query(collection(db, 'opportunities'));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  let count = 0;
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  await batch.commit();
  console.log(`✓ Cleared ${count} old opportunities`);
  return count;
}

/**
 * Ingest scholarship data into Firestore
 */
export async function ingestScholarships(): Promise<{
  success: boolean;
  total: number;
  imported: number;
  errors: number;
  message: string;
}> {
  try {
    console.log('🔄 Starting scholarship data ingestion...');

    // 1. Fetch raw data from sources
    console.log('📥 Fetching data from sources...');
    const rawData = await getAllScholarshipData();
    console.log(`✓ Fetched ${rawData.length} scholarships from sources`);

    if (rawData.length === 0) {
      return {
        success: false,
        total: 0,
        imported: 0,
        errors: 0,
        message: 'No scholarships found from any source',
      };
    }

    // 2. Clean and validate data
    console.log('🧹 Cleaning and validating data...');
    const cleanedData = rawData
      .map(cleanAndValidateData)
      .filter((item): item is Opportunity => item !== null);

    const errorsCount = rawData.length - cleanedData.length;
    console.log(
      `✓ Validated ${cleanedData.length} scholarships (${errorsCount} rejected)`
    );

    if (cleanedData.length === 0) {
      return {
        success: false,
        total: rawData.length,
        imported: 0,
        errors: errorsCount,
        message: 'No valid scholarships after cleaning',
      };
    }

    // 3. Clear old data
    await clearOldData();

    // 4. Batch write to Firestore
    console.log('💾 Writing to Firestore...');
    const batch = writeBatch(db);
    const collectionRef = collection(db, 'opportunities');

    cleanedData.forEach((scholarship) => {
      const docRef = doc(collectionRef);
      batch.set(docRef, {
        ...scholarship,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: 'automated-scraper',
      });
    });

    await batch.commit();
    console.log(`✓ Successfully imported ${cleanedData.length} scholarships`);

    // 5. Log metadata
    console.log('\n📊 Import Summary:');
    console.log(`   Total processed: ${rawData.length}`);
    console.log(`   Successfully imported: ${cleanedData.length}`);
    console.log(`   Errors/Filtered: ${errorsCount}`);
    
    // Log by field
    const fieldCounts = cleanedData.reduce((acc, s) => {
      acc[s.academic_field] = (acc[s.academic_field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('   By Field:', fieldCounts);

    return {
      success: true,
      total: rawData.length,
      imported: cleanedData.length,
      errors: errorsCount,
      message: `Successfully ingested ${cleanedData.length} scholarships`,
    };
  } catch (error) {
    console.error('❌ Error during data ingestion:', error);
    return {
      success: false,
      total: 0,
      imported: 0,
      errors: 0,
      message: `Data ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get fresh data and update Firestore (main entry point)
 */
export async function refreshScholarshipData() {
  console.log('\n🚀 === SCHOLARSHIP DATA REFRESH ===\n');
  const result = await ingestScholarships();
  console.log('\n✅ Data refresh complete!', result);
  return result;
}
