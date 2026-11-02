import React, { useState } from 'react';
import { IndexedFile } from '../types.ts';
import { X, Copy, ExternalLink, RefreshCw, Trash2, Check, FileText, Hash, Clock, HardDrive, Maximize2 } from 'lucide-react';
import { ThumbnailImage } from './ThumbnailImage.tsx';

interface FileInspectorModalProps {
  file: IndexedFile | null;
  onClose: () => void;
  onReindexFile: (fileId: string) => Promise<any>;
  onRemoveFile: (fileId: string) => Promise<any>;
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
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({
  file,
  onClose,
  onReindexFile,
  onRemoveFile
}) => {
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  if (!file) return null;

  const fullPath = `${file.folderPath}/${file.relativePath}`;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fullPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(file.contentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await onReindexFile(file.id);
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate" title={file.fileName}>
              {file.fileName}
            </h3>
            <p className="text-xs text-neutral-400 font-mono truncate">
              {file.relativePath}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: High-resolution preview image */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <ThumbnailImage
                src={file.imageUrl || file.thumbnailUrl || `/api/files/${file.id}/raw`}
                alt={file.fileName}
                fileType={file.fileType}
                fileExtension={file.fileExtension}
                className="w-full h-full object-contain"
              />
              {file.isDuplicate && (
                <div className="absolute top-3 left-3 bg-amber-500 text-neutral-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  DUPLICATE RECORD
                </div>
              )}
            </div>

            {/* Semantic Description */}
            <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Multimodal Description &amp; Visual Scene
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {file.description || 'No visual description available.'}
              </p>
            </div>

            {/* Tags Strip (Zero-Pill Discipline: unboxed text with separators) */}
            <div className="text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300 mr-2">Detected Concepts:</span>
              <span>{file.tags.join(' · ')}</span>
            </div>
          </div>

          {/* Right: Technical Metadata & EXIF */}
          <div className="space-y-4 text-xs font-mono">
            {/* Properties Grid */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80 font-sans">
                <span className="font-semibold text-white">File Specifications</span>
                <span className="uppercase text-amber-400 font-bold">{file.fileType}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">File Size:</span>
                <span className="text-white tabular-nums">{formatBytes(file.fileSizeBytes)}</span>
              </div>

              {file.width && file.height && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Dimensions:</span>
                  <span className="text-white tabular-nums">{file.width} × {file.height} px</span>
                </div>
              )}

              {file.pageCount && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Document Pages:</span>
                  <span className="text-white tabular-nums">{file.pageCount} pages</span>
                </div>
              )}

              {file.durationSeconds && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Video Duration:</span>
                  <span className="text-white tabular-nums">{file.durationSeconds} seconds</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Created:</span>
                <span className="text-neutral-300">{formatDate(file.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Indexed:</span>
                <span className="text-neutral-300">{formatDate(file.indexedAt)}</span>
              </div>
            </div>

            {/* Cryptographic & Perceptual Hashes */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">SHA-256 Hash:</span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{file.contentHash.slice(0, 16)}...</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Perceptual pHash:</span>
                <span className="text-neutral-300">{file.perceptualHash || 'N/A'}</span>
              </div>
            </div>

            {/* OCR Extracted Text (if document/receipt) */}
            {file.ocrSnippet && (
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 space-y-1.5">
                <span className="font-sans font-semibold text-white block">
                  OCR Text Extraction
                </span>
                <pre className="text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto no-scrollbar font-mono">
                  {file.ocrSnippet}
                </pre>
              </div>
            )}

            {/* Full Path Bar */}
            <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-400 truncate" title={fullPath}>
                {fullPath}
              </span>
              <button
                onClick={handleCopyPath}
                className="p-1 text-neutral-400 hover:text-white transition-colors shrink-0"
                title="Copy Full Path"
              >
                {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              onRemoveFile(file.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove from Index</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReindex}
              disabled={isReindexing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin' : ''}`} />
              <span>Re-index Embedding</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
