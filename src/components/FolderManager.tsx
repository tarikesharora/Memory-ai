import React, { useState } from 'react';
import { AuthorizedFolder } from '../types.ts';
import { FolderGit2, Plus, Trash2, CheckCircle2, ShieldAlert, FolderOpen } from 'lucide-react';

interface FolderManagerProps {
  folders: AuthorizedFolder[];
  onAddFolderClick: () => void;
  onRemoveFolder: (id: string) => Promise<any>;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  folders,
  onAddFolderClick,
  onRemoveFolder
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await onRemoveFolder(id);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Authorized Local Folders</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            LensLocal only accesses and indexes directories you explicitly authorize below.
          </p>
        </div>
        <button
          onClick={onAddFolderClick}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Authorize Folder</span>
        </button>
      </div>

      {/* Safety Policy Notice */}
      <div className="flex items-start gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-200">Filesystem Safety Boundaries:</strong> To protect your operating system, whole root drives (e.g. <code className="text-amber-300">C:\</code> or <code className="text-amber-300">/</code>) and symlink loops are intentionally rejected by the scanner. Always authorize specific content folders like <code className="text-amber-300">~/Pictures</code> or <code className="text-amber-300">~/Documents</code>.
        </div>
      </div>

      {/* Folders List Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-950/60 text-neutral-400 border-b border-neutral-800 font-medium">
            <tr>
              <th className="py-3 px-4">Folder Name</th>
              <th className="py-3 px-4">Local Directory Path</th>
              <th className="py-3 px-4">Indexed Items</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Scanned</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
            {folders.map((f) => (
              <tr key={f.id} className="hover:bg-neutral-800/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400/90 shrink-0" />
                  <span>{f.name}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-neutral-400 truncate max-w-xs" title={f.path}>
                  {f.path}
                </td>
                <td className="py-3.5 px-4 font-mono tabular-nums text-white">
                  {f.fileCount} files
                </td>
                <td className="py-3.5 px-4">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium capitalize">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{f.status}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                  {formatDate(f.lastScannedAt)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleRemove(f.id)}
                    disabled={removingId === f.id}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors rounded-md"
                    title="Remove folder and purge its search records"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
