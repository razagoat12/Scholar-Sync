'use client';

import { Opportunity } from '@/types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
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

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const urgent = isDeadlineUrgent(opportunity.deadline);
  const passed = isDeadlinePassed(opportunity.deadline);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6">
      {/* Badge for urgent deadlines */}
      {urgent && (
        <div className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Deadline Soon
        </div>
      )}
      {passed && (
        <div className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Closed
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {opportunity.title}
      </h3>

      {/* Provider */}
      <p className="text-sm text-gray-600 mb-3">{opportunity.provider}</p>

      {/* Meta info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {opportunity.academic_field}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded">
            {opportunity.education_level}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          📍 {opportunity.country}
        </div>
      </div>

      {/* Description preview */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
        {opportunity.description}
      </p>

      {/* Deadline */}
      <div className={`text-sm font-medium mb-4 ${urgent ? 'text-red-600' : 'text-gray-600'}`}>
        Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </div>

      {/* CTA Button */}
      <a
        href={opportunity.application_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Learn More
      </a>
    </div>
  );
}
