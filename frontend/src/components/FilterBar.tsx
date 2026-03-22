import type { Category } from '../data/types';
import { categories } from '../data/mockBusinesses';

export type SortOption = 'relevance' | 'confidence' | 'name';
export type SourceFilter = 'all' | 'street_view' | 'social_media' | 'both';
export type DistanceFilter = '500m' | '1km' | '2km' | '5km';

const distanceOptions: DistanceFilter[] = ['500m', '1km', '2km', '5km'];

interface FilterBarProps {
  category: Category;
  onCategoryChange: (cat: Category) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sourceFilter: SourceFilter;
  onSourceChange: (source: SourceFilter) => void;
  distance: DistanceFilter;
  onDistanceChange: (dist: DistanceFilter) => void;
  resultCount: number;
  query?: string;
}

const sourcePills: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'street_view', label: 'Street View Only' },
  { value: 'social_media', label: 'Registry Only' },
];

export default function FilterBar({
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  sourceFilter,
  onSourceChange,
  distance,
  onDistanceChange,
  resultCount,
  query,
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 py-3 px-4 space-y-3">
      {/* Row 1: Category + Distance Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === cat.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

        {distanceOptions.map((dist) => (
          <button
            key={dist}
            onClick={() => onDistanceChange(dist)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              distance === dist
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {dist}
          </button>
        ))}
      </div>

      {/* Row 2: Source pills + sort text + result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sourcePills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => onSourceChange(pill.value)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                sourceFilter === pill.value
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {query && (
            <span className="text-sm text-gray-500">
              <span className="text-gray-700 font-medium">{resultCount}</span>
              {' results for '}
              <span className="text-[#e88c0a] font-medium">'{query}'</span>
            </span>
          )}
          <button
            onClick={() => onSortChange(sortBy === 'confidence' ? 'relevance' : 'confidence')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sorted by {sortBy}
          </button>
        </div>
      </div>
    </div>
  );
}
