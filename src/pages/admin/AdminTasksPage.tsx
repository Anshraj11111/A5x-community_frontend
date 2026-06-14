import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Zap, Trash2, Pencil, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import { clubTaskService, type IClubTask } from '@/services/clubTaskService';
import { championshipService, type IChampionshipSeason } from '@/services/championshipService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TaskForm {
  title: string;
  description: string;
  points: string;
  seasonId: string;
  dueDate: string;
}

const EMPTY: TaskForm = { title: '', description: '', points: '50', seasonId: '', dueDate: '' };

const formToPayload = (f: TaskForm) => ({
  title: f.title.trim(),
  description: f.description.trim(),
  points: parseInt(f.points) || 50,
  seasonId: f.seasonId || undefined,
  dueDate: f.dueDate || undefined,
});

// ── TaskFormFields — MUST be outside the parent component ─────────────────────
// Defining it inside causes React to unmount/remount on every keystroke (focus loss).

interface TaskFormFieldsProps {
  f: TaskForm;
  setF: React.Dispatch<React.SetStateAction<TaskForm>>;
  seasons: IChampionshipSeason[];
}

function TaskFormFields({ f, setF, seasons }: TaskFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Title *</label>
        <Input
          placeholder="e.g. Post 5 discussions this week"
          value={f.title}
          onChange={e => setF(p => ({ ...p, title: e.target.value }))}
          required
          maxLength={100}
          className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white placeholder:!text-[#555]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">Description *</label>
        <Textarea
          placeholder="What does the club need to do?"
          value={f.description}
          onChange={e => setF(p => ({ ...p, description: e.target.value }))}
          required
          className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white placeholder:!text-[#555] min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">Points</label>
          <Input
            type="number"
            min={1}
            max={10000}
            value={f.points}
            onChange={e => setF(p => ({ ...p, points: e.target.value }))}
            className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white">
            Due Date <span className="text-[#555] font-normal">(optional)</span>
          </label>
          <Input
            type="date"
            value={f.dueDate}
            onChange={e => setF(p => ({ ...p, dueDate: e.target.value }))}
            className="!bg-[#0d0d0d] !border-[#2a2a2a] !text-white [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-white">
          Link to Season{' '}
          <span className="text-[#555] font-normal">(optional — points count toward leaderboard)</span>
        </label>
        <select
          value={f.seasonId}
          onChange={e => setF(p => ({ ...p, seasonId: e.target.value }))}
          className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00FF88] [color-scheme:dark]"
        >
          <option value="">No season (standalone task)</option>
          {seasons.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.status})
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminTasksPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<IClubTask | null>(null);
  const [form, setForm] = useState<TaskForm>(EMPTY);
  const [editForm, setEditForm] = useState<TaskForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<IClubTask | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-club-tasks'],
    queryFn: () => clubTaskService.getAllTasks({ limit: 100 }),
  });
  const tasks: IClubTask[] = data?.data ?? [];

  const { data: seasons = [] } = useQuery({
    queryKey: ['championship', 'seasons'],
    queryFn: () => championshipService.getAllSeasons(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof formToPayload>) => clubTaskService.createTask(payload),
    onSuccess: task => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['club-tasks'] });
      success(`Task "${task.title}" created`);
      setShowCreate(false);
      setForm(EMPTY);
    },
    onError: (err: unknown) =>
      toastError(
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Failed to create task'
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ReturnType<typeof formToPayload>> }) =>
      clubTaskService.updateTask(id, payload),
    onSuccess: task => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['club-tasks'] });
      success(`Task "${task.title}" updated`);
      setEditTarget(null);
    },
    onError: (err: unknown) =>
      toastError(
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Failed to update task'
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clubTaskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['club-tasks'] });
      success('Task deleted');
      setDeleteTarget(null);
    },
    onError: () => toastError('Failed to delete task'),
  });

  const toggleActive = (task: IClubTask) => {
    updateMutation.mutate({ id: task._id, payload: { isActive: !task.isActive } });
  };

  const openEdit = (task: IClubTask) => {
    setEditTarget(task);
    setEditForm({
      title: task.title,
      description: task.description,
      points: task.points.toString(),
      seasonId: task.season?._id ?? '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#00FF88]" /> Club Tasks
          </h1>
          <p className="text-sm text-[#666] mt-0.5">{tasks.length} tasks · shown to all users</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5"
          size="sm"
        >
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-10 text-center">
          <Zap className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-[#666] mb-4">No tasks yet</p>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Create First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task._id}
              className={cn(
                'rounded-xl border bg-[#0d0d0d] p-5 transition-all',
                task.isActive ? 'border-[#1a1a1a] hover:border-[#2a2a2a]' : 'border-[#111] opacity-60'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded-full">
                      +{task.points} pts
                    </span>
                    {task.season && (
                      <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                        🏆 {task.season.name}
                      </Badge>
                    )}
                    {!task.isActive && (
                      <Badge className="text-[10px] bg-[#1a1a1a] text-[#666] border-[#222]">Inactive</Badge>
                    )}
                    {task.dueDate && (
                      <span className="text-[10px] text-[#555]">Due {formatDate(task.dueDate)}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white">{task.title}</p>
                  <p className="text-xs text-[#666] mt-0.5 line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[#444]">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {task.completedCount ?? 0} clubs completed
                    </span>
                    <span>{formatRelativeTime(task.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(task)}
                    title={task.isActive ? 'Deactivate' : 'Activate'}
                    className="p-1.5 rounded-lg text-[#444] hover:text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors"
                  >
                    {task.isActive
                      ? <ToggleRight className="h-4 w-4 text-[#00FF88]" />
                      : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(task)}
                    title="Edit"
                    className="p-1.5 rounded-lg text-[#444] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(task)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={o => { if (!o) { setShowCreate(false); setForm(EMPTY); } }}>
        <DialogContent className="max-w-lg !bg-[#0a0a0a] !border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle className="text-white">New Club Task</DialogTitle>
            <DialogDescription className="text-[#666]">
              All clubs will see this task and can complete it for points.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => { e.preventDefault(); createMutation.mutate(formToPayload(form)); }}
            className="space-y-4 mt-2"
          >
            <TaskFormFields f={form} setF={setForm} seasons={seasons} />
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowCreate(false); setForm(EMPTY); }}
                className="border-[#2a2a2a] text-white hover:bg-[#111]"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
                {createMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={o => { if (!o) setEditTarget(null); }}>
        <DialogContent className="max-w-lg !bg-[#0a0a0a] !border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Task</DialogTitle>
            <DialogDescription className="text-[#666]">Update this task's details.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (editTarget) updateMutation.mutate({ id: editTarget._id, payload: formToPayload(editForm) });
            }}
            className="space-y-4 mt-2"
          >
            <TaskFormFields f={editForm} setF={setEditForm} seasons={seasons} />
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="border-[#2a2a2a] text-white hover:bg-[#111]"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ─────────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm !bg-[#0a0a0a] !border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Task</DialogTitle>
            <DialogDescription className="text-[#666]">
              Delete{' '}
              <span className="text-white font-medium">"{deleteTarget?.title}"</span>?
              All completion records will be removed too.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-[#2a2a2a] text-white hover:bg-[#111]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
