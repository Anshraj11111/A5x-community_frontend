import { Link } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ScoreBreakdownBar } from './ScoreBreakdownBar';
import { formatNumber } from '@/lib/utils';
import type { IClubScore } from '@/services/championshipService';
import type { IPagination } from '@/types/index';

interface LeaderboardTableProps {
  scores: IClubScore[];
  isLoading?: boolean;
  pagination?: IPagination;
}

const MEDAL: Record<number, string> = { 1: '🏆', 2: '🥈', 3: '🥉' };

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4"><div className="h-4 w-6 rounded bg-secondary animate-pulse" /></td>
      <td className="py-3 px-4"><div className="h-4 w-32 rounded bg-secondary animate-pulse" /></td>
      <td className="py-3 px-4"><div className="h-4 w-16 rounded bg-secondary animate-pulse" /></td>
      <td className="py-3 px-4"><div className="h-2 w-24 rounded bg-secondary animate-pulse" /></td>
    </tr>
  );
}

export function LeaderboardTable({ scores, isLoading, pagination }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wide">
            <th className="py-3 px-4 text-left w-12">Rank</th>
            <th className="py-3 px-4 text-left">Club</th>
            <th className="py-3 px-4 text-right">Score</th>
            <th className="py-3 px-4 text-left min-w-[140px]">Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : scores.map((entry) => (
                <tr
                  key={entry._id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  {/* Rank */}
                  <td className="py-3 px-4 font-bold text-base">
                    {MEDAL[entry.rank ?? 0] ?? (
                      <span className="text-muted-foreground text-sm">#{entry.rank}</span>
                    )}
                  </td>

                  {/* Club */}
                  <td className="py-3 px-4">
                    <Link
                      to={`/clubs/${entry.club?.slug ?? ''}`}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <span className="text-lg">{entry.club?.icon || '🏅'}</span>
                      <div>
                        <p className="font-medium leading-tight">{entry.club?.name ?? '—'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatNumber(entry.club?.memberCount ?? 0)} members
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Total Score */}
                  <td className="py-3 px-4 text-right font-bold text-primary">
                    {formatNumber(entry.totalScore)}
                  </td>

                  {/* Breakdown bar with tooltip */}
                  <td className="py-3 px-4">
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <div className="cursor-pointer">
                            <ScoreBreakdownBar
                              breakdown={entry.breakdown ?? {}}
                              totalScore={entry.totalScore}
                            />
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="rounded-md bg-popover border border-border px-3 py-2 text-xs shadow-md space-y-1 max-w-[200px]"
                            sideOffset={6}
                          >
                            {Object.entries(entry.breakdown ?? {})
                              .filter(([, v]) => v > 0)
                              .map(([action, pts]) => (
                                <div key={action} className="flex justify-between gap-4">
                                  <span className="text-muted-foreground capitalize">
                                    {action.replace(/([A-Z])/g, ' $1')}
                                  </span>
                                  <span className="font-bold text-primary">{pts}</span>
                                </div>
                              ))}
                            <Tooltip.Arrow className="fill-border" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </td>
                </tr>
              ))}

          {!isLoading && scores.length === 0 && (
            <tr>
              <td colSpan={4} className="py-10 text-center text-muted-foreground text-sm">
                No clubs on the leaderboard yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground text-center">
          Page {pagination.page} of {pagination.totalPages} · {pagination.total} clubs
        </div>
      )}
    </div>
  );
}
