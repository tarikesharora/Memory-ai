import React, { useState } from 'react';
import { DuplicateGroup, IndexedFile } from '../types.ts';
import { Copy, Trash2, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { ThumbnailImage } from './ThumbnailImage.tsx';

interface DuplicatesHubProps {
  groups: DuplicateGroup[];
  onResolve: (duplicateId: string, action: 'remove_from_index' | 'keep_both') => void;
  onSelectFile: (file: IndexedFile) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export const DuplicatesHub: React.FC<DuplicatesHubProps> = ({
  groups,
  onResolve,
  onSelectFile
}) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const totalWastedBytes = groups.reduce((acc, g) => acc + g.wastedBytes, 0);
  const totalDuplicateCopies = groups.reduce((acc, g) => acc + g.duplicates.length, 0);

  const handleResolveClick = async (id: string, action: 'remove_from_index' | 'keep_both') => {
    setResolvingId(id);
    try {
      await onResolve(id, action);
    } finally {
      setResolvingId(null);
    }
  };

  if (groups.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Duplicate Files Detected</h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Every file in your authorized folders has a unique cryptographic content hash and perceptual embedding. LensLocal's in-batch deduplication engine actively guards new scans against redundant index records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Reclaimable Space</span>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {formatBytes(totalWastedBytes)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Wasted in redundant copies</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Duplicate Clusters</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {groups.length} groups
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Matching SHA-256 &amp; pHash</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400 font-medium">Redundant File Records</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {totalDuplicateCopies} copies
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Safe to clean from index</span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Non-Destructive Index Cleaning:</strong> Resolving a duplicate removes its record from the search database without deleting or modifying any file on your local storage drive.
        </span>
      </div>

      {/* Duplicate Groups List */}
      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div
            key={group.hash}
            className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Cluster #{idx + 1}</span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  SHA256: {group.hash.slice(0, 16)}...
                </span>
              </div>
              <span className="font-mono text-amber-400 tabular-nums font-medium">
                {formatBytes(group.wastedBytes)} reclaimable
              </span>
            </div>

            {/* Content: Primary vs Duplicates */}
            <div className="p-4 space-y-4">
              {/* Primary Original File */}
              <div className="flex items-center justify-between gap-4 p-3 bg-neutral-950/40 border border-neutral-800/60 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => onSelectFile(group.primaryFile)}
                    className="w-12 h-12 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800 cursor-pointer"
                  >
                    <ThumbnailImage
                      src={group.primaryFile.thumbnailUrl || `/api/files/${group.primaryFile.id}/thumbnail`}
                      alt={group.primaryFile.fileName}
                      fileType={group.primaryFile.fileType}
                      fileExtension={group.primaryFile.fileExtension}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                        PRIMARY ORIGINAL
                      </span>
                      <h4
                        onClick={() => onSelectFile(group.primaryFile)}
                        className="text-xs font-semibold text-white truncate cursor-pointer hover:underline"
                      >
                        {group.primaryFile.fileName}
                      </h4>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono tabular-nums mt-0.5 truncate">
                      <span>{group.primaryFile.relativePath}</span>
                      <span className="mx-1.5">·</span>
                      <span>{formatBytes(group.primaryFile.fileSizeBytes)}</span>
                      <span className="mx-1.5">·</span>
                      <span>{formatDate(group.primaryFile.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectFile(group.primaryFile)}
                  className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors shrink-0"
                >
                  Inspect
                </button>
              </div>

              {/* Duplicate Copies */}
              <div className="pl-6 space-y-2 border-l-2 border-amber-500/20">
                <span className="text-[11px] font-medium text-neutral-400 block mb-1">
                  Identified Redundant Copies ({group.duplicates.length}):
                </span>

                {group.duplicates.map((dup) => (
                  <div
                    key={dup.id}
                    className="flex items-center justify-between gap-4 p-2.5 bg-neutral-950/20 border border-neutral-800/40 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        onClick={() => onSelectFile(dup)}
                        className="w-10 h-10 rounded bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800 cursor-pointer"
                      >
                        <ThumbnailImage
                          src={dup.thumbnailUrl || `/api/files/${dup.id}/thumbnail`}
                          alt={dup.fileName}
                          fileType={dup.fileType}
                          fileExtension={dup.fileExtension}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-white truncate block">
                          {dup.fileName}
                        </span>
                        <div className="text-[11px] text-neutral-500 font-mono tabular-nums truncate">
                          <span>{dup.relativePath}</span>
                          <span className="mx-1">·</span>
                          <span>{formatBytes(dup.fileSizeBytes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveClick(dup.id, 'remove_from_index')}
                        disabled={resolvingId === dup.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-md transition-colors"
                        title="Remove duplicate from search index"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove from Index</span>
                      </button>
                      <button
                        onClick={() => handleResolveClick(dup.id, 'keep_both')}
                        disabled={resolvingId === dup.id}
                        className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
                        title="Keep both as separate search entities"
                      >
                        Keep Both
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
