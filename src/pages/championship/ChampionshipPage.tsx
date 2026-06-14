import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { championshipService, championshipKeys } from '@/services/championshipService';
import { useChampionshipSocket } from '@/hooks/useChampionshipSocket';
import { SeasonCountdown } from '@/components/championship/SeasonCountdown';
import { ScoringRulesCard } from '@/components/championship/ScoringRulesCard';
import { LeaderboardTable } from '@/components/championship/LeaderboardTable';
import { PodiumDisplay } from '@/components/championship/PodiumDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import type { IPagination } from '@/types/index';

export default function ChampionshipPage() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  // Fetch current/active season
  const { data: currentSeason, isLoading: seasonLoading } = useQuery({
    queryKey: championshipKeys.currentSeason,
    queryFn: () => championshipService.getCurrentSeason(),
  });

  // Fetch all seasons for history selector
  const { data: allSeasons = [] } = useQuery({
    queryKey: championshipKeys.seasons,
    queryFn: () => championshipService.getAllSeasons(),
  });

  // Active leaderboard season: selected historical one OR current
  const leaderboardSeasonId = selectedSeasonId ?? currentSeason?._id ?? '';

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: championshipKeys.leaderboard(leaderboardSeasonId),
    queryFn: () => championshipService.getLeaderboard(leaderboardSeasonId),
    enabled: !!leaderboardSeasonId,
  });

  // Real-time updates for the active season
  useChampionshipSocket(currentSeason?._id);

  const endedSeasons = allSeasons.filter((s) => s.status === 'ended');

  if (seasonLoading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Championship</h1>
          <p className="text-sm text-muted-foreground">Club competition leaderboard</p>
        </div>
      </div>

      {/* Active Season Banner */}
      {!currentSeason ? (
        <EmptyState
          icon={Trophy}
          title="No active season"
          description="Check back soon — a new championship season is coming."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {currentSeason.status === 'active' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wide">
                    ● Live
                  </span>
                )}
                {currentSeason.status === 'ended' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">
                    Ended
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold">{currentSeason.name}</h2>
              {currentSeason.description && (
                <p className="text-sm text-muted-foreground mt-1">{currentSeason.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(currentSeason.startDate)} → {formatDate(currentSeason.endDate)}
              </p>
            </div>

            {currentSeason.status === 'active' && (
              <div className="shrink-0">
                <p className="text-xs text-muted-foreground mb-1">Ends in</p>
                <SeasonCountdown endDate={currentSeason.endDate} />
              </div>
            )}
          </div>

          <ScoringRulesCard scoringRules={currentSeason.scoringRules} />
        </div>
      )}

      {/* Leaderboard Section */}
      {leaderboardSeasonId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-semibold">Leaderboard</h2>

            {/* Season selector */}
            {allSeasons.length > 1 && (
              <select
                value={selectedSeasonId ?? ''}
                onChange={(e) => setSelectedSeasonId(e.target.value || null)}
                className="text-xs rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Current Season</option>
                {endedSeasons.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <LeaderboardTable
            scores={leaderboardData?.scores ?? []}
            isLoading={leaderboardLoading}
            pagination={leaderboardData?.pagination as IPagination | undefined}
          />
        </div>
      )}

      {/* Season History / Podiums */}
      {endedSeasons.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-base font-semibold">Season History</h2>
          {endedSeasons.map((season) => (
            <div key={season._id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <h3 className="font-semibold">{season.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatDate(season.startDate)} → {formatDate(season.endDate)}
                </p>
              </div>
              {season.topClubs && season.topClubs.length > 0 ? (
                <PodiumDisplay
                  topClubs={season.topClubs.map((tc) => ({
                    rank: tc.rank,
                    score: tc.score,
                    club: {
                      _id: typeof tc.club === 'string' ? tc.club : (tc.club as { _id?: string })?._id ?? '',
                      name: (tc.club as { name?: string })?.name ?? '—',
                      icon: (tc.club as { icon?: string })?.icon,
                      slug: (tc.club as { slug?: string })?.slug ?? '',
                    },
                  }))}
                />
              ) : (
                <p className="px-5 pb-4 text-xs text-muted-foreground">No top clubs recorded.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
