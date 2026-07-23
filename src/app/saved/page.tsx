'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookmarks } from '@/services/bookmarkService';
import { type Scholarship } from '@/lib/api';
import OpportunityCard from '@/components/OpportunityCard';

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getBookmarks(user.uid)
      .then(setBookmarks)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-base flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-lime animate-spin" strokeWidth={2} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="font-display text-5xl font-semibold text-ink mb-2 text-center">
          Saved Scholarships
        </h1>
        <p className="text-muted text-center mb-16">
          Scholarships you&apos;ve bookmarked for later
        </p>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-lime animate-spin" strokeWidth={2} />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-24 bg-surface border border-dashed border-border rounded-2xl">
            <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-ink text-xl font-semibold mb-2">No saved scholarships yet</p>
            <p className="text-muted mb-8">
              Browse scholarships and tap the bookmark icon to save them here.
            </p>
            <a
              href="/browse"
              className="inline-flex items-center px-6 py-3 bg-lime hover:bg-lime-400 text-base font-semibold rounded-xl transition-all cursor-pointer"
            >
              Browse Scholarships
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onBookmarkChange={(id, isBookmarked) => {
                  if (!isBookmarked) {
                    setBookmarks((prev) => prev.filter((b) => b.id !== id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
