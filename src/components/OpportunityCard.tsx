'use client';

import { type Scholarship } from '@/lib/api';

interface OpportunityCardProps {
  opportunity: Scholarship;
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

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const urgent = isDeadlineUrgent(opportunity.deadline);
  const passed = isDeadlinePassed(opportunity.deadline);
  const daysRemaining = getDaysUntilDeadline(opportunity.deadline);

  return (
    <div className="bg-white hover:bg-cream-light border border-warm-peach rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group hover:scale-105 hover:-translate-y-1 relative">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-warm-gold via-warm-orange to-transparent opacity-5 rounded-bl-full"></div>
      
      {/* Warm gradient accent bar at top */}
      <div className="h-1.5 bg-gradient-to-r from-warm-orange via-warm-terracotta to-warm-gold group-hover:shadow-lg"></div>

      <div className="p-6 relative z-10">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.featured && (
            <div className="inline-flex items-center gap-1 bg-warm-gold bg-opacity-20 text-warm-brown font-bold px-3 py-1 rounded-full text-xs border border-warm-gold border-opacity-40">
              ⭐ Featured
            </div>
          )}
          {urgent && (
            <div className="inline-flex items-center gap-1 bg-warm-terracotta bg-opacity-20 text-warm-terracotta font-bold px-3 py-1 rounded-full text-xs border border-warm-terracotta border-opacity-40 animate-pulse">
              🔥 {daysRemaining} days left
            </div>
          )}
          {passed && (
            <div className="inline-flex items-center gap-1 bg-warm-brown bg-opacity-10 text-warm-brown font-semibold px-3 py-1 rounded-full text-xs">
              ✓ Closed
            </div>
          )}
          {opportunity.funding_type && (
            <div className="inline-flex items-center gap-1 bg-warm-orange bg-opacity-15 text-warm-orange font-semibold px-3 py-1 rounded-full text-xs border border-warm-orange border-opacity-30">
              💰 {opportunity.funding_type}
            </div>
          )}
          {opportunity.open_to_international && (
            <div className="inline-flex items-center gap-1 bg-warm-brown bg-opacity-10 text-warm-brown font-semibold px-3 py-1 rounded-full text-xs">
              🌍 International
            </div>
          )}
        </div>

        {/* Title with icon */}
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xl flex-shrink-0 mt-0.5">🏆</span>
          <h3 className="text-lg font-bold text-warm-brown line-clamp-2 group-hover:text-warm-terracotta transition-colors">
            {opportunity.title}
          </h3>
        </div>

        {/* Provider with icon */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🤝</span>
          <p className="text-sm text-warm-brown text-opacity-70 font-medium">{opportunity.provider}</p>
        </div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span className="font-medium bg-warm-orange bg-opacity-15 text-warm-brown px-2 py-1 rounded-lg truncate border border-warm-orange border-opacity-20">
              {opportunity.academic_field}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="font-medium bg-warm-gold bg-opacity-15 text-warm-brown px-2 py-1 rounded-lg truncate border border-warm-gold border-opacity-20">
              {opportunity.education_level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <span className="font-medium bg-warm-terracotta bg-opacity-15 text-warm-brown px-2 py-1 rounded-lg truncate border border-warm-terracotta border-opacity-20">
              {opportunity.country}
            </span>
          </div>
          {opportunity.amount && (
            <div className="flex items-center gap-2">
              <span className="text-lg">💵</span>
              <span className="font-semibold text-warm-brown">
                ${opportunity.amount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Description preview */}
        <p className="text-sm text-warm-brown text-opacity-75 mb-4 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Coverage (if available) */}
        {opportunity.coverage && opportunity.coverage.length > 0 && (
          <div className="mb-4 pb-4 border-b border-warm-peach border-opacity-50">
            <p className="text-xs font-semibold text-warm-brown mb-2">Coverage:</p>
            <div className="flex flex-wrap gap-1">
              {opportunity.coverage.slice(0, 3).map((item, idx) => (
                <span key={idx} className="text-xs bg-warm-orange bg-opacity-10 text-warm-brown px-2 py-1 rounded-full border border-warm-orange border-opacity-20">
                  {item.replace(/_/g, ' ')}
                </span>
              ))}
              {opportunity.coverage.length > 3 && (
                <span className="text-xs text-warm-brown text-opacity-60">+{opportunity.coverage.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Requirements (if available) */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div className="mb-4 pb-4 border-b border-warm-peach border-opacity-50">
            <p className="text-xs font-semibold text-warm-brown mb-2">Requirements:</p>
            <div className="flex flex-wrap gap-1">
              {opportunity.requirements.slice(0, 3).map((req, idx) => (
                <span key={idx} className="text-xs bg-warm-gold bg-opacity-10 text-warm-brown px-2 py-1 rounded-full border border-warm-gold border-opacity-20">
                  {req.replace(/_/g, ' ')}
                </span>
              ))}
              {opportunity.requirements.length > 3 && (
                <span className="text-xs text-warm-brown text-opacity-60">+{opportunity.requirements.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Tags (if available) */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {opportunity.tags.slice(0, 4).map((tag, idx) => (
                <span key={idx} className="text-xs bg-warm-brown bg-opacity-8 text-warm-brown px-2 py-1 rounded-full border border-warm-brown border-opacity-20">
                  #{tag}
                </span>
              ))}
              {opportunity.tags.length > 4 && (
                <span className="text-xs text-warm-brown text-opacity-60">+{opportunity.tags.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Deadline Info */}
        <div className={`text-sm font-semibold mb-5 px-4 py-3 rounded-lg border transition-all flex items-center gap-2 ${
          urgent
            ? 'bg-warm-terracotta bg-opacity-15 text-warm-terracotta border-warm-terracotta border-opacity-30 animate-pulse'
            : passed
            ? 'bg-warm-brown bg-opacity-8 text-warm-brown border-warm-brown border-opacity-20'
            : 'bg-warm-orange bg-opacity-15 text-warm-orange border-warm-orange border-opacity-30'
        }`}>
          <span className="text-base">{passed ? '⏱️' : urgent ? '⚡' : '📅'}</span>
          <div>
            <span className="font-bold">{new Date(opportunity.deadline).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}</span>
            {!passed && daysRemaining >= 0 && (
              <span className={`ml-2 font-normal text-xs ${urgent ? 'animate-pulse font-bold' : ''}`}>
                • {daysRemaining}d left
              </span>
            )}
          </div>
        </div>

        {/* CTA Button with enhanced design */}
        <a
          href={opportunity.application_link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block w-full text-center font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            urgent
              ? 'bg-gradient-to-r from-warm-terracotta to-warm-orange hover:shadow-lg text-white'
              : passed
              ? 'bg-warm-brown bg-opacity-30 text-warm-brown text-opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-r from-warm-orange to-warm-gold hover:shadow-lg text-white'
          }${!passed ? ' group-hover:scale-105 group-hover:-translate-y-1' : ''}`}
          onClick={(e) => passed && e.preventDefault()}
        >
          <span className="text-lg">{passed ? '❌' : urgent ? '🎯' : '🚀'}</span>
          <span>{passed ? 'Application Closed' : urgent ? 'Apply Urgently' : 'Apply Now'}</span>
        </a>
      </div>
    </div>
  );
}
