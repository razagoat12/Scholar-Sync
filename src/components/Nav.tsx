'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Nav() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/browse');
  };

  return (
    <nav className="sticky top-0 z-50 bg-base/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/browse"
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink hover:text-lime transition-colors"
        >
          <GraduationCap className="w-6 h-6 text-lime" strokeWidth={2} />
          ScholarSync
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            Browse
          </Link>

          {!loading && user && (
            <Link
              href="/saved"
              className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              <Bookmark className="w-4 h-4" strokeWidth={2} />
              Saved
            </Link>
          )}

          {!loading && (
            user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-border text-ink hover:border-border-strong hover:bg-surface transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold px-4 py-2 rounded-full bg-lime text-base hover:bg-lime-400 transition-all cursor-pointer"
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
