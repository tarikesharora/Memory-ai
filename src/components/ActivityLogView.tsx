import React, { useState } from 'react';
import { ActivityLog } from '../types.ts';
import { ShieldCheck, Filter } from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredLogs = filterCategory === 'all'
    ? logs
    : logs.filter(l => l.category === filterCategory);

  return (
    <div className="space-y-4">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero-Leakage Audit Log:</strong> Logs strictly record worker states, duplicate resolution, and scanner cycles. Document contents, OCR text, and private metadata are never emitted into system event logs.
          </span>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-800">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer capitalize"
          >
            <option value="all" className="bg-neutral-900">All Categories</option>
            <option value="indexer" className="bg-neutral-900">Indexer</option>
            <option value="duplicate" className="bg-neutral-900">Duplicate</option>
            <option value="scanner" className="bg-neutral-900">Scanner</option>
            <option value="model" className="bg-neutral-900">Model</option>
            <option value="system" className="bg-neutral-900">System</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-xs overflow-hidden">
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto no-scrollbar">
          {filteredLogs.length === 0 ? (
            <p className="text-neutral-500 py-8 text-center">No logs matching selected category.</p>
          ) : (
            filteredLogs.map((log) => {
              const levelColor =
                log.level === 'error'
                  ? 'text-rose-400'
                  : log.level === 'warn'
                  ? 'text-amber-400'
                  : log.level === 'success'
                  ? 'text-emerald-400'
                  : 'text-neutral-400';

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-1 px-2 rounded hover:bg-neutral-900/60 transition-colors"
                >
                  <span className="text-neutral-500 shrink-0 tabular-nums">
                    [{formatTime(log.timestamp)}]
                  </span>
                  <span className={`uppercase font-semibold text-[10px] px-1 rounded bg-neutral-900 shrink-0 ${levelColor}`}>
                    {log.category}
                  </span>
                  <span className="text-neutral-200 leading-relaxed break-all">
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
