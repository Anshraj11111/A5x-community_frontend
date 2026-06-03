import { useState, useEffect } from 'react';
import { ScrollText, Trash2, User, Ban, FileText, Flag, Lightbulb, Bug } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';

// ── Lightweight client-side audit log ─────────────────────────────────────────
// We store audit events in localStorage keyed by 'a5x-audit-log'.
// The backend can be extended later with a real audit collection.

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  detail: string;
  adminName: string;
  timestamp: string;
  category: 'user' | 'content' | 'report' | 'feature' | 'bug' | 'system';
}

const CATEGORY_META: Record<AuditEntry['category'], { icon: React.ElementType; color: string; bg: string }> = {
  user:    { icon: User,        color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  content: { icon: FileText,    color: 'text-purple-400',  bg: 'bg-purple-400/10' },
  report:  { icon: Flag,        color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  feature: { icon: Lightbulb,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  bug:     { icon: Bug,         color: 'text-red-400',     bg: 'bg-red-400/10' },
  system:  { icon: ScrollText,  color: 'text-[#00FF88]',   bg: 'bg-[#00FF88]/10' },
};

const SAMPLE_LOG: AuditEntry[] = [
  {
    id: 's1', action: 'User banned', entity: 'User', detail: '@john_doe banned for spam',
    adminName: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), category: 'user',
  },
  {
    id: 's2', action: 'Role changed', entity: 'User', detail: '@jane_smith promoted to moderator',
    adminName: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), category: 'user',
  },
  {
    id: 's3', action: 'Report resolved', entity: 'Report', detail: 'Spam report on post #abc resolved',
    adminName: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), category: 'report',
  },
  {
    id: 's4', action: 'Feature status updated', entity: 'Feature', detail: '"Dark mode" moved to in_development',
    adminName: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), category: 'feature',
  },
  {
    id: 's5', action: 'Post pinned', entity: 'Content', detail: '"Weekly thread" pinned',
    adminName: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), category: 'content',
  },
];

const STORAGE_KEY = 'a5x-audit-log';

export function appendAuditLog(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: AuditEntry[] = raw ? JSON.parse(raw) : [];
    const newEntry: AuditEntry = {
      ...entry,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
    };
    // Keep last 200 entries
    const updated = [newEntry, ...existing].slice(0, 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently ignore storage errors
  }
}

function readAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const FILTERS = ['all', 'user', 'content', 'report', 'feature', 'bug', 'system'] as const;

export default function AdminAuditPage() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [liveLog, setLiveLog] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setLiveLog(readAuditLog());
  }, []);

  const combined = liveLog.length > 0 ? liveLog : SAMPLE_LOG;
  const filtered = filter === 'all' ? combined : combined.filter(e => e.category === filter);

  const clearLog = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLiveLog([]);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-[#666] mt-0.5">{filtered.length} entries · client-side log</p>
        </div>
        {liveLog.length > 0 && (
          <button
            onClick={clearLog}
            className="flex items-center gap-1.5 text-xs text-[#444] hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            Clear log
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-1 w-fit flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filter === f ? 'bg-[#1a1a1a] text-white' : 'text-[#444] hover:text-white'
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Notice about client-side logging */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-[#00FF88]/5 border border-[#00FF88]/10">
        <ScrollText className="h-3.5 w-3.5 text-[#00FF88] shrink-0 mt-0.5" />
        <p className="text-xs text-[#666]">
          This is a client-side audit log stored in your browser. For production, extend with a backend{' '}
          <code className="text-[#00FF88] font-mono">AuditLog</code> collection.
          {liveLog.length === 0 && ' Sample data shown below.'}
        </p>
      </div>

      {/* Log entries */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div className="divide-y divide-[#111]">
          {filtered.map(entry => {
            const meta = CATEGORY_META[entry.category];
            const Icon = meta.icon;
            return (
              <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#111] transition-colors">
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mt-0.5', meta.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">{entry.action}</span>
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize',
                      meta.color, meta.bg, 'border-current/20'
                    )}>
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">{entry.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#444]">{entry.adminName}</p>
                  <p className="text-[10px] text-[#333] mt-0.5">{formatRelativeTime(entry.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#444] text-sm">No log entries for this category</div>
        )}
      </div>
    </div>
  );
}
