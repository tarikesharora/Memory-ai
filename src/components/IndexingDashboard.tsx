import React, { useState } from 'react';
import { IndexerStatus } from '../types.ts';
import { Play, Pause, XCircle, RefreshCw, Trash2, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface IndexingDashboardProps {
  status: IndexerStatus;
  onAction: (action: string) => Promise<any>;
  onRefreshSampleLibrary: () => Promise<any>;
}

export const IndexingDashboard: React.FC<IndexingDashboardProps> = ({
  status,
  onAction,
  onRefreshSampleLibrary
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    try {
      await onAction(action);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSeedSamples = async () => {
    setLoadingAction('seed');
    try {
      await onRefreshSampleLibrary();
    } finally {
      setLoadingAction(null);
    }
  };

  const percentComplete = status.totalItems > 0
    ? Math.round((status.indexedItems / status.totalItems) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Indexer Status Strip */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status.state === 'indexing'
                ? 'bg-amber-400 animate-ping'
                : status.state === 'paused'
                ? 'bg-amber-600'
                : 'bg-emerald-400'
            }`} />
            <div>
              <h3 className="text-sm font-semibold text-white capitalize">
                Worker Status: {status.state}
              </h3>
              <p className="text-xs text-neutral-400 font-mono tabular-nums">
                {status.state === 'indexing'
                  ? `Processing batch #${status.currentBatch} (${status.itemsPerSecond} items/sec · ETA ${status.etaSeconds}s)`
                  : 'Vector indexing idle · All authorized directories synchronized'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {status.state === 'indexing' ? (
              <button
                onClick={() => handleAction('pause')}
                disabled={!!loadingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : status.state === 'paused' ? (
              <button
                onClick={() => handleAction('resume')}
                disabled={!!loadingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            ) : null}

            {status.state === 'indexing' && (
              <button
                onClick={() => handleAction('cancel')}
                disabled={!!loadingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={() => handleAction('reindex_all')}
              disabled={!!loadingAction || status.state === 'indexing'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              title="Perform full incremental re-scan across all folders"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-index All</span>
            </button>

            {status.failedItems > 0 && (
              <button
                onClick={() => handleAction('retry_failed')}
                disabled={!!loadingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/40 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Failed ({status.failedItems})</span>
              </button>
            )}

            <button
              onClick={() => handleAction('clear')}
              disabled={!!loadingAction || status.state === 'indexing'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-400 bg-neutral-900 hover:bg-rose-950/30 border border-neutral-800 rounded-lg transition-colors"
              title="Clear all indexed records (files on disk are safe)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Index</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-neutral-400">
            <span>Overall Progress</span>
            <span>
              {status.indexedItems} / {status.totalItems} files ({percentComplete}%)
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className={`h-full transition-all duration-300 ${
                status.state === 'indexing'
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Total Indexed Records</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {status.indexedItems}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Active embeddings</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Duplicate Files Filtered</span>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {status.duplicateItems}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Deduplicated in batch</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Indexing Throughput</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {status.itemsPerSecond} <span className="text-xs font-normal text-neutral-400">files/s</span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">SIMD vector projection</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Failed Corrupted Items</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {status.failedItems}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">0 errors nominal</span>
        </div>
      </div>

      {/* Synthetic Sample Library Card */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Realistic Synthetic Sample Library</h4>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl">
            Populate LensLocal with 24 high-fidelity sample files (mountain sunsets, receipts, tax documents, drone videos, code screenshots, and duplicate sets) to test natural language search and deduplication.
          </p>
        </div>
        <button
          onClick={handleSeedSamples}
          disabled={!!loadingAction}
          className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          {loadingAction === 'seed' ? 'Refreshing Library...' : 'Refresh Sample Library'}
        </button>
      </div>
    </div>
  );
};
