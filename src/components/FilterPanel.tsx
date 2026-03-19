'use client';

interface FilterPanelProps {
  academicFields: string[];
  educationLevels: string[];
  selectedField: string;
  selectedLevel: string;
  onFieldChange: (field: string) => void;
  onLevelChange: (level: string) => void;
  onReset: () => void;
}

export default function FilterPanel({
  academicFields,
  educationLevels,
  selectedField,
  selectedLevel,
  onFieldChange,
  onLevelChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Field Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Field
          </label>
          <select
            value={selectedField}
            onChange={(e) => onFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">All Fields</option>
            {academicFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        {/* Education Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">All Levels</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}
