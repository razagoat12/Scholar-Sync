'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  Star,
  DollarSign,
  Globe2,
  ArrowUpRight,
} from 'lucide-react';
import { type Scholarship } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { addBookmark, removeBookmark, isBookmarked as checkIsBookmarked } from '@/services/bookmarkService';

interface OpportunityCardProps {
  opportunity: Scholarship;
  onBookmarkChange?: (opportunityId: string, bookmarked: boolean) => void;
}

const isDeadlineUrgent = (deadline: string): boolean => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
};

const isDeadlinePassed = (deadline: string): boolean => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return deadlineDate < now;
};

const getDaysUntilDeadline = (deadline: string): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export default function OpportunityCard({ opportunity, onBookmarkChange }: OpportunityCardProps) {
  const urgent = isDeadlineUrgent(opportunity.deadline);
  const passed = isDeadlinePassed(opportunity.deadline);
  const daysRemaining = getDaysUntilDeadline(opportunity.deadline);

  const { user } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setBookmarked(false);
      return;
    }
    checkIsBookmarked(user.uid, opportunity.id).then(setBookmarked);
  }, [user, opportunity.id]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setBookmarkBusy(true);
    try {
      if (bookmarked) {
        await removeBookmark(user.uid, opportunity.id);
        setBookmarked(false);
        onBookmarkChange?.(opportunity.id, false);
      } else {
        await addBookmark(user.uid, opportunity);
        setBookmarked(true);
        onBookmarkChange?.(opportunity.id, true);
      }
    } finally {
      setBookmarkBusy(false);
    }
  };

  return (
    <div className="relative bg-surface border border-border rounded-2xl hover:border-border-strong transition-all duration-200 overflow-hidden group">
      {/* Bookmark toggle */}
      <button
        onClick={handleToggleBookmark}
        disabled={bookmarkBusy}
        aria-label={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
        className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-surface-2 border border-border hover:border-border-strong transition-all disabled:opacity-50 cursor-pointer"
      >
        {bookmarked ? (
          <BookmarkCheck className="w-4 h-4 text-lime" strokeWidth={2} />
        ) : (
          <Bookmark className="w-4 h-4 text-muted group-hover:text-ink transition-colors" strokeWidth={2} />
        )}
      </button>

      <div className="p-6">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4 pr-10">
          {opportunity.featured && (
            <div className="inline-flex items-center gap-1 bg-lime-dim text-lime font-semibold px-2.5 py-1 rounded-full text-xs border border-lime/30">
              <Star className="w-3 h-3" strokeWidth={2} fill="currentColor" />
              Featured
            </div>
          )}
          {urgent && (
            <div className="inline-flex items-center gap-1 bg-danger/10 text-danger font-semibold px-2.5 py-1 rounded-full text-xs border border-danger/30">
              <Flame className="w-3 h-3" strokeWidth={2} />
              {daysRemaining}d left
            </div>
          )}
          {passed && (
            <div className="inline-flex items-center gap-1 bg-surface-3 text-muted font-medium px-2.5 py-1 rounded-full text-xs">
              <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
              Closed
            </div>
          )}
          {opportunity.funding_type && (
            <div className="inline-flex items-center gap-1 bg-surface-3 text-ink font-medium px-2.5 py-1 rounded-full text-xs">
              <DollarSign className="w-3 h-3" strokeWidth={2} />
              {opportunity.funding_type}
            </div>
          )}
          {opportunity.open_to_international && (
            <div className="inline-flex items-center gap-1 bg-surface-3 text-muted font-medium px-2.5 py-1 rounded-full text-xs">
              <Globe2 className="w-3 h-3" strokeWidth={2} />
              International
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-semibold text-ink line-clamp-2 mb-1.5 group-hover:text-lime transition-colors">
          {opportunity.title}
        </h3>

        {/* Provider */}
        <p className="text-sm text-muted mb-4">{opportunity.provider}</p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
            <span className="truncate">{opportunity.academic_field}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
            <span className="truncate">{opportunity.education_level}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
            <span className="truncate">{opportunity.country}</span>
          </div>
          {opportunity.amount && (
            <div className="flex items-center gap-1.5 text-ink font-medium">
              ${opportunity.amount.toLocaleString()}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Coverage */}
        {opportunity.coverage && opportunity.coverage.length > 0 && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs font-semibold text-ink mb-2">Coverage</p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.coverage.slice(0, 3).map((item, idx) => (
                <span key={idx} className="text-xs bg-surface-3 text-muted px-2 py-1 rounded-full">
                  {item.replace(/_/g, ' ')}
                </span>
              ))}
              {opportunity.coverage.length > 3 && (
                <span className="text-xs text-muted">+{opportunity.coverage.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Requirements */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs font-semibold text-ink mb-2">Requirements</p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.requirements.slice(0, 3).map((req, idx) => (
                <span key={idx} className="text-xs bg-surface-3 text-muted px-2 py-1 rounded-full">
                  {req.replace(/_/g, ' ')}
                </span>
              ))}
              {opportunity.requirements.length > 3 && (
                <span className="text-xs text-muted">+{opportunity.requirements.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {opportunity.tags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="text-xs text-muted">
                #{tag}
              </span>
            ))}
            {opportunity.tags.length > 4 && (
              <span className="text-xs text-muted">+{opportunity.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Deadline */}
        <div
          className={`flex items-center gap-2 text-sm font-medium mb-5 px-4 py-3 rounded-xl border ${
            urgent
              ? 'bg-danger/10 text-danger border-danger/30'
              : passed
              ? 'bg-surface-3 text-muted border-transparent'
              : 'bg-surface-2 text-ink border-border'
          }`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          <span className="font-semibold">
            {new Date(opportunity.deadline).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {!passed && daysRemaining >= 0 && (
            <span className="text-xs opacity-80">&bull; {daysRemaining}d left</span>
          )}
        </div>

        {/* CTA */}
        <a
          href={opportunity.application_link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full text-center font-semibold py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
            passed
              ? 'bg-surface-3 text-muted cursor-not-allowed'
              : 'bg-lime text-base hover:bg-lime-400'
          }`}
          onClick={(e) => passed && e.preventDefault()}
        >
          <span>{passed ? 'Application Closed' : 'Apply Now'}</span>
          {!passed && <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />}
        </a>
      </div>
    </div>
  );
}
