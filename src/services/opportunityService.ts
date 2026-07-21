// src/services/opportunityService.ts
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Opportunity } from '../types/opportunity';

/**
 * Get all opportunities
 */
export async function getAllOpportunities(): Promise<Opportunity[]> {
  try {
    const snapshot = await getDocs(collection(db, 'opportunities'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Opportunity));
  } catch (error) {
    console.error('Error fetching all opportunities:', error);
    return [];
  }
}

/**
 * Get opportunities filtered by academic field
 */
export async function getOpportunitiesByField(
  field: string
): Promise<Opportunity[]> {
  try {
    const q = query(
      collection(db, 'opportunities'),
      where('academic_field', '==', field),
      orderBy('deadline', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Opportunity));
  } catch (error) {
    console.error(`Error fetching opportunities for field ${field}:`, error);
    return [];
  }
}

/**
 * Get opportunities filtered by education level
 */
export async function getOpportunitiesByLevel(
  level: string
): Promise<Opportunity[]> {
  try {
    const q = query(
      collection(db, 'opportunities'),
      where('education_level', '==', level),
      orderBy('deadline', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Opportunity));
  } catch (error) {
    console.error(`Error fetching opportunities for level ${level}:`, error);
    return [];
  }
}

/**
 * Get opportunities by country
 */
export async function getOpportunitiesByCountry(
  country: string
): Promise<Opportunity[]> {
  try {
    const q = query(
      collection(db, 'opportunities'),
      where('country', '==', country),
      orderBy('deadline', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Opportunity));
  } catch (error) {
    console.error(`Error fetching opportunities for country ${country}:`, error);
    return [];
  }
}

/**
 * Get opportunities expiring soon (within N days)
 */
export async function getExpiringOpportunities(daysAhead: number = 14): Promise<Opportunity[]> {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const allOps = await getAllOpportunities();
    return allOps
      .filter((opp) => {
        const deadline = new Date(opp.deadline);
        return deadline >= now && deadline <= futureDate;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } catch (error) {
    console.error('Error fetching expiring opportunities:', error);
    return [];
  }
}

/**
 * Get statistics about opportunities
 */
export async function getOpportunitiesStats(): Promise<{
  total: number;
  byField: Record<string, number>;
  byLevel: Record<string, number>;
  byCountry: Record<string, number>;
  lastUpdated: string;
}> {
  try {
    const allOps = await getAllOpportunities();

    return {
      total: allOps.length,
      byField: countBy(allOps, (o) => o.academic_field),
      byLevel: countBy(allOps, (o) => o.education_level),
      byCountry: countBy(allOps, (o) => o.country),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching opportunities stats:', error);
    return {
      total: 0,
      byField: {},
      byLevel: {},
      byCountry: {},
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Helper: Count occurrences
 */
function countBy<T>(
  items: T[],
  selector: (item: T) => string
): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
