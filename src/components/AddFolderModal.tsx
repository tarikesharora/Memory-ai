import React, { useState } from 'react';
import { X, FolderPlus, ShieldAlert, Check } from 'lucide-react';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFolder: (path: string, name?: string) => Promise<{ success: boolean; error?: string }>;
}

const PRESET_PATHS = [
  { name: 'My Camera Roll', path: '~/Pictures/Camera_Roll_2026' },
  { name: 'Receipts & Taxes', path: '~/Documents/Financial_Receipts_2026' },
  { name: 'Drone 4K Footage', path: '~/Volumes/SD_DRONE/DCIM' },
  { name: 'Downloads Media', path: '~/Downloads/Unsorted_Photos' }
];

export const AddFolderModal: React.FC<AddFolderModalProps> = ({
  isOpen,
  onClose,
  onAddFolder
}) => {
  const [folderPath, setFolderPath] = useState('');
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = folderPath.trim();
    if (!clean) {
      setError('Please provide a valid directory path.');
      return;
    }

    if (clean === '/' || clean.toLowerCase() === 'c:\\' || clean.toLowerCase() === 'c:/') {
      setError('Whole drive authorization is rejected for operating system safety.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onAddFolder(clean, folderName.trim() || undefined);
      if (!res.success) {
        setError(res.error || 'Failed to authorize folder.');
      } else {
        setFolderPath('');
        setFolderName('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Authorize Local Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Directory Path <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="e.g. ~/Pictures/Vacation_2026 or D:\Photos"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Vacation Highlights"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-neutral-500 font-medium">Quick Path Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PATHS.map((preset) => (
                <button
                  type="button"
                  key={preset.path}
                  onClick={() => {
                    setFolderPath(preset.path);
                    setFolderName(preset.name);
                  }}
                  className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Safety note */}
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            All files are processed locally. Files are indexed recursively while avoiding symlink recursion and skipping hidden system directories.
          </p>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? 'Authorizing...' : 'Authorize &amp; Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
