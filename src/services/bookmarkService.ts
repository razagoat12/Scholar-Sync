// src/services/bookmarkService.ts
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Scholarship } from '../lib/api';

function bookmarksRef(uid: string) {
  return collection(db, 'users', uid, 'bookmarks');
}

export async function addBookmark(uid: string, opportunity: Scholarship): Promise<void> {
  await setDoc(doc(bookmarksRef(uid), opportunity.id), {
    ...opportunity,
    savedAt: serverTimestamp(),
  });
}

export async function removeBookmark(uid: string, opportunityId: string): Promise<void> {
  await deleteDoc(doc(bookmarksRef(uid), opportunityId));
}

export async function isBookmarked(uid: string, opportunityId: string): Promise<boolean> {
  const snap = await getDoc(doc(bookmarksRef(uid), opportunityId));
  return snap.exists();
}

export async function getBookmarks(uid: string): Promise<Scholarship[]> {
  const snap = await getDocs(bookmarksRef(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Scholarship));
}
