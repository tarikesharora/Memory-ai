import React from 'react';
import { SearchResultItem, IndexedFile } from '../types.ts';
import { Eye, RefreshCw, Trash2, Copy, FileText, Film, Image as ImageIcon } from 'lucide-react';
import { ThumbnailImage } from './ThumbnailImage.tsx';

interface FileListProps {
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

export const FileList: React.FC<FileListProps> = ({
  results,
  onSelectFile,
  onReindexFile,
  onRemoveFile
}) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-950/60 text-neutral-400 border-b border-neutral-800 font-medium">
            <tr>
              <th className="py-3 px-4">Match</th>
              <th className="py-3 px-4">File Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Dimensions</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono tabular-nums text-neutral-300">
            {results.map(({ file, score, clipSimilarity, lexicalScore }) => {
              const scorePercent = Math.round(score * 100);

              return (
                <tr
                  key={file.id}
                  className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectFile(file)}
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-amber-400">{scorePercent}%</span>
                  </td>
                  <td className="py-2.5 px-4 font-sans font-medium text-white max-w-sm truncate">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800">
                        <ThumbnailImage
                          src={file.thumbnailUrl || `/api/files/${file.id}/thumbnail`}
                          alt={file.fileName}
                          fileType={file.fileType}
                          fileExtension={file.fileExtension}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {file.isDuplicate && (
                            <span className="font-mono text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-bold">
                              DUP
                            </span>
                          )}
                          <span className="truncate block font-semibold">{file.fileName}</span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono block truncate">
                          {file.relativePath}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 uppercase text-neutral-400">
                    {file.fileExtension}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {file.width && file.height ? `${file.width}×${file.height}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {formatBytes(file.fileSizeBytes)}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {formatDate(file.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectFile(file)}
                        className="p-1.5 hover:text-white text-neutral-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onReindexFile(file.id)}
                        className="p-1.5 hover:text-white text-neutral-400 transition-colors"
                        title="Re-index"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveFile(file.id)}
                        className="p-1.5 hover:text-rose-400 text-neutral-400 transition-colors"
                        title="Remove from Index"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
