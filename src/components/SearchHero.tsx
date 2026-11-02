import React from 'react';
import { Search, X, SlidersHorizontal, LayoutGrid, ListFilter, Sparkles } from 'lucide-react';
import { FileType } from '../types.ts';

interface SearchHeroProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearchSubmit: () => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  minSimilarity: number;
  onMinSimilarityChange: (val: number) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
  isSearching: boolean;
}

const EXAMPLE_QUERIES = [
  'mountain peak sunset',
  'coffee shop receipt',
  'dark mode code editor',
  'dog playing with frisbee',
  'turquoise beach waves',
  'w2 tax document',
  'kitten sleeping on couch',
  'tokyo night timelapse'
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  query,
  onQueryChange,
  onSearchSubmit,
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  minSimilarity,
  onMinSimilarityChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  totalResults,
  isSearching
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-600 transition-all shadow-sm">
        <div className="pl-4 pr-2 text-neutral-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search with natural language concepts (e.g. 'sunset mountain', 'coffee receipt', 'dog running')..."
          className="w-full py-3.5 bg-transparent text-white placeholder-neutral-500 focus:outline-none text-sm"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="p-1.5 mr-2 text-neutral-400 hover:text-white rounded-md transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="pr-3">
          <button
            onClick={onSearchSubmit}
            disabled={isSearching}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Query Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-neutral-500 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Try:</span>
        </span>
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            onClick={() => {
              onQueryChange(example);
            }}
            className="px-2.5 py-1 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Filter and View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800/60 text-xs">
        {/* Left: Type filters segmented button */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          {(['all', 'image', 'document', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors capitalize ${
                selectedType === type
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {type === 'all' ? 'All Types' : `${type}s`}
            </button>
          ))}
        </div>

        {/* Right: Date, Threshold, Sort, View Layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Select */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg text-neutral-300">
            <span className="text-neutral-500">Date:</span>
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="any" className="bg-neutral-900 text-white">Any time</option>
              <option value="7d" className="bg-neutral-900 text-white">Last 7 days</option>
              <option value="30d" className="bg-neutral-900 text-white">Last 30 days</option>
              <option value="1y" className="bg-neutral-900 text-white">Last year</option>
            </select>
          </div>

          {/* Similarity Threshold */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-neutral-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500">Similarity:</span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={minSimilarity}
              onChange={(e) => onMinSimilarityChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-neutral-700 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-neutral-200 w-8 tabular-nums">
              {Math.round(minSimilarity * 100)}%
            </span>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg text-neutral-300">
            <span className="text-neutral-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="relevance" className="bg-neutral-900 text-white">Relevance</option>
              <option value="date_desc" className="bg-neutral-900 text-white">Newest first</option>
              <option value="date_asc" className="bg-neutral-900 text-white">Oldest first</option>
              <option value="size_desc" className="bg-neutral-900 text-white">Largest size</option>
              <option value="size_asc" className="bg-neutral-900 text-white">Smallest size</option>
              <option value="name" className="bg-neutral-900 text-white">Name (A-Z)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-0.5 p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
