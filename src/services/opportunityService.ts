// src/services/opportunityService.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Opportunity } from '../types/opportunity';

export async function getAllOpportunities(): Promise<Opportunity[]> {
  const snapshot = await getDocs(collection(db, 'opportunities'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
}
