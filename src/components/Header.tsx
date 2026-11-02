import React from 'react';
import { Search, CopyCheck, FolderGit2, Cpu, Activity, Plus } from 'lucide-react';

export type ActiveTab = 'search' | 'duplicates' | 'folders' | 'indexer' | 'model' | 'activity';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddFolderClick: () => void;
  duplicateCount: number;
  isIndexing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onAddFolderClick,
  duplicateCount,
  isIndexing
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            LensLocal
          </span>
          <span className="hidden sm:inline-block text-xs text-neutral-400 font-mono">
            v1.2 · on-device CLIP
          </span>
        </div>

        {/* Zone 2: Single-line clean navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('search')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'search' ? 'text-white border-b-2 border-amber-500' : 'hover:text-neutral-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search &amp; Browse</span>
          </button>

          <button
            onClick={() => onTabChange('duplicates')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'duplicates' ? 'text-white border-b-2 border-amber-500' : 'hover:text-neutral-200'
            }`}
          >
            <CopyCheck className="w-4 h-4" />
            <span>Duplicates</span>
            {duplicateCount > 0 && (
              <span className="font-mono text-xs text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded">
                {duplicateCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('indexer')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'indexer' ? 'text-white border-b-2 border-amber-500' : 'hover:text-neutral-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Indexing Worker</span>
            {isIndexing && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onTabChange('folders')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'folders' ? 'text-white border-b-2 border-amber-500' : 'hover:text-neutral-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Authorized Folders</span>
          </button>

          <button
            onClick={() => onTabChange('model')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'model' ? 'text-white border-b-2 border-amber-500' : 'hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>CLIP Model</span>
          </button>

          <button
            onClick={() => onTabChange('activity')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'activity' ? 'text-white border-b-2 border-amber-500' : 'hover:text-neutral-200'
            }`}
          >
            <span>Activity Log</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onAddFolderClick}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Folder</span>
          </button>
        </div>
      </div>
    </header>
  );
};
