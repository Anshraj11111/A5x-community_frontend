import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, Trophy, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/store/uiStore';
import { clubTaskService, type IClubTask } from '@/services/clubTaskService';
import { clubService } from '@/services/clubService';
import { QUERY_KEYS } from '@/lib/constants';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';

export default function ClubTasksPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  // Fetch all active tasks
  const { data, isLoading } = useQuery({
    queryKey: ['club-tasks'],
    queryFn: () => clubTaskService.getAllTasks({ limit: 50 }),
  });
  const tasks: IClubTask[] = data?.data ?? [];

  // Fetch user's clubs to show completion picker
  const { data: myClubsData } = useQuery({
    queryKey: [QUERY_KEYS.CLUBS, 'mine'],
    queryFn: () => clubService.getClubs({ limit: 50 }),
    enabled: isAuthenticated,
  });
  const myClubs = (myClubsData?.data ?? []).filter((c: { isMember?: boolean }) => c.isMember);

  const handleComplete = async (task: IClubTask, clubSlug: string) => {
    setCompletingTask(task._id);
    try {
      await clubTaskService.completeTask(task._id, clubSlug);
      success(`✅ Task marked complete! +${task.points} pts for your club`);
      queryClient.invalidateQueries({ queryKey: ['club-tasks'] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed');
    } finally {
      setCompletingTask(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Club Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete tasks to earn points for your club on the championship leaderboard
          </p>
        </div>
        <Link to="/championship">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Leaderboard
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <InlineLoader />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No tasks yet"
          description="The founder hasn't posted any tasks yet. Check back soon!"
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isExpanded = expandedTask === task._id;
            const completedCount = task.completedCount ?? 0;

            return (
              <Card key={task._id} className="overflow-hidden">
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Zap className="h-3 w-3" /> +{task.points} pts
                        </span>
                        {task.season && (
                          <Badge variant="secondary" className="text-[10px]">
                            🏆 {task.season.name}
                          </Badge>
                        )}
                        {task.myClubCompleted && (
                          <Badge className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-base">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    </div>

                    <button
                      onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {completedCount} club{completedCount !== 1 ? 's' : ''} completed
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Expanded section */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      {/* Who completed */}
                      {(task.completedByClubs ?? []).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Completed by</p>
                          <div className="flex flex-wrap gap-2">
                            {task.completedByClubs?.map(({ club, completedAt }) => (
                              <Link
                                key={club._id}
                                to={`/clubs/${club.slug}`}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium"
                              >
                                {club.icon ? (
                                  <img src={club.icon} alt="" className="h-4 w-4 rounded" />
                                ) : (
                                  <span>🏅</span>
                                )}
                                {club.name}
                                <span className="text-muted-foreground font-normal">
                                  · {formatRelativeTime(completedAt)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Complete task button */}
                      {isAuthenticated && !task.myClubCompleted && myClubs.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Complete for your club</p>
                          <div className="flex flex-wrap gap-2">
                            {myClubs.map((club: { _id: string; slug: string; name: string; icon?: string }) => (
                              <Button
                                key={club._id}
                                size="sm"
                                variant="outline"
                                disabled={completingTask === task._id}
                                onClick={() => handleComplete(task, club.slug)}
                                className="h-8 gap-1.5 text-xs"
                              >
                                {club.icon ? <img src={club.icon} alt="" className="h-4 w-4 rounded" /> : '🏅'}
                                {club.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isAuthenticated && (
                        <Link to="/login">
                          <Button size="sm" variant="outline" className="text-xs">Sign in to complete tasks</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
