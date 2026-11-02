import React from 'react';
import { SearchResultItem, IndexedFile } from '../types.ts';
import { Eye, ExternalLink, RefreshCw, Trash2, Copy, FileText, Film, Image as ImageIcon } from 'lucide-react';
import { ThumbnailImage } from './ThumbnailImage.tsx';

interface FileGridProps {
  results: SearchResultItem[];
  onSelectFile: (file: IndexedFile) => void;
  onReindexFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
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

export const FileGrid: React.FC<FileGridProps> = ({
  results,
  onSelectFile,
  onReindexFile,
  onRemoveFile
}) => {
  if (results.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-neutral-800 rounded-xl">
        <p className="text-neutral-400 font-medium">No matching files found.</p>
        <p className="text-xs text-neutral-500 mt-1">
          Try broadening your search query or decreasing the similarity threshold slider.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {results.map(({ file, score, clipSimilarity, lexicalScore, matchedTags }) => {
        const scorePercent = Math.round(score * 100);
        const clipPercent = Math.round(clipSimilarity * 100);

        return (
          <div
            key={file.id}
            className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
          >
            {/* Visual Thumbnail / Preview Box */}
            <div
              onClick={() => onSelectFile(file)}
              className="relative aspect-4/3 w-full bg-neutral-950 overflow-hidden cursor-pointer flex items-center justify-center"
            >
              <ThumbnailImage
                src={file.thumbnailUrl || `/api/files/${file.id}/thumbnail`}
                alt={file.fileName}
                fileType={file.fileType}
                fileExtension={file.fileExtension}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />

              {/* Duplicate Flag */}
              {file.isDuplicate && (
                <div className="absolute top-2.5 left-2.5 bg-amber-500 text-neutral-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </div>
              )}

              {/* Match Score Indicator (Top Right) */}
              <div
                className="absolute top-2.5 right-2.5 bg-neutral-950/80 backdrop-blur-md border border-neutral-700/60 text-white px-2 py-0.5 rounded text-xs font-mono font-medium"
                title={`Hybrid: ${scorePercent}% (CLIP: ${clipPercent}% · Lexical: ${Math.round(lexicalScore * 100)}%)`}
              >
                <span className="text-amber-400 tabular-nums">{scorePercent}%</span>
                <span className="text-neutral-400 text-[10px] ml-1">match</span>
              </div>

              {/* Hover Quick Actions Overlay */}
              <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFile(file);
                  }}
                  className="p-2 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-lg border border-neutral-700 transition-colors"
                  title="Inspect Metadata & EXIF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReindexFile(file.id);
                  }}
                  className="p-2 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-lg border border-neutral-700 transition-colors"
                  title="Re-index file embeddings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                  className="p-2 bg-neutral-900/90 hover:bg-rose-950 text-rose-300 rounded-lg border border-neutral-700 hover:border-rose-800 transition-colors"
                  title="Remove from index (original untouched)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 space-y-2">
              {/* Clean unboxed filename & extension */}
              <div className="flex items-start justify-between gap-2">
                <h4
                  onClick={() => onSelectFile(file)}
                  className="text-sm font-semibold text-white hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                  title={file.fileName}
                >
                  {file.fileName}
                </h4>
              </div>

              {/* Natural Prose Description */}
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {file.description || 'No description available'}
              </p>

              {/* Clean Unboxed Metadata Strip (Rule 1.A: Zero-Pill Discipline) */}
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono tabular-nums pt-1 border-t border-neutral-800/60">
                <span className="uppercase text-neutral-300 font-semibold">{file.fileExtension}</span>
                <span aria-hidden="true">·</span>
                <span>{formatBytes(file.fileSizeBytes)}</span>
                <span aria-hidden="true">·</span>
                {file.width && file.height ? (
                  <>
                    <span>{file.width}×{file.height}</span>
                    <span aria-hidden="true">·</span>
                  </>
                ) : null}
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
