import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserAvatar } from '@/components/common/UserAvatar';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { bugService } from '@/services/bugService';
import { useToast } from '@/store/uiStore';
import { cn, formatRelativeTime } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import type { IBugReport, BugSeverity } from '@/types';

const SEVERITY_COLORS: Record<string, string> = { low: 'text-blue-400 bg-blue-400/10', medium: 'text-yellow-400 bg-yellow-400/10', high: 'text-orange-400 bg-orange-400/10', critical: 'text-red-400 bg-red-400/10' };
const STATUS_LABELS: Record<string, string> = { reported: 'Reported', confirmed: 'Confirmed', investigating: 'Investigating', fixed: 'Fixed', released: 'Released' };
const STATUS_COLORS: Record<string, string> = { reported: 'text-yellow-400 bg-yellow-400/10', confirmed: 'text-orange-400 bg-orange-400/10', investigating: 'text-purple-400 bg-purple-400/10', fixed: 'text-primary bg-primary/10', released: 'text-primary bg-primary/10' };

export default function BugsPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', steps: '', severity: 'medium' as BugSeverity });

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BUGS, { statusFilter, severityFilter }],
    queryFn: () => bugService.getBugs({ status: statusFilter || undefined, severity: severityFilter || undefined, limit: 30 }),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bugService.createBug(form);
      success('Bug report submitted');
      setShowCreate(false);
      setForm({ title: '', description: '', steps: '', severity: 'medium' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BUGS] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bug Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Help us improve A5X by reporting issues</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Report Bug</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex h-9 rounded-lg border border-border bg-secondary px-3 py-1 text-sm text-foreground focus-visible:outline-none">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="flex h-9 rounded-lg border border-border bg-secondary px-3 py-1 text-sm text-foreground focus-visible:outline-none">
          <option value="">All Severities</option>
          {(['low', 'medium', 'high', 'critical'] as BugSeverity[]).map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {isLoading ? <InlineLoader /> : data?.data.length === 0 ? (
        <EmptyState icon={Bug} title="No bug reports" description="No bugs matching your filters"
          action={<Button size="sm" onClick={() => setShowCreate(true)}>Report a Bug</Button>} />
      ) : (
        <div className="space-y-3">
          {data?.data.map((bug: IBugReport) => (
            <Card key={bug._id} className="p-5 transition-all duration-200 hover:border-border/80">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge className={cn('text-[10px]', SEVERITY_COLORS[bug.severity])}>{bug.severity}</Badge>
                <Badge className={cn('text-[10px]', STATUS_COLORS[bug.status] || '')}>{STATUS_LABELS[bug.status] || bug.status}</Badge>
              </div>
              <h3 className="font-semibold text-sm">{bug.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bug.description}</p>
              {bug.adminNote && (
                <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-primary font-medium">Developer Response</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{bug.adminNote}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-3">
                <UserAvatar user={bug.reporter} size="xs" />
                <span className="text-xs text-muted-foreground">{bug.reporter.displayName} · {formatRelativeTime(bug.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report a Bug</DialogTitle>
            <DialogDescription>Help us fix issues by providing detailed information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Brief description of the bug" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required minLength={5} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="What happened? What did you expect?" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="min-h-[100px]" required minLength={20} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Steps to Reproduce <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Textarea placeholder="1. Go to...&#10;2. Click on..." value={form.steps} onChange={(e) => setForm(f => ({ ...f, steps: e.target.value }))} className="min-h-[80px]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Severity</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high', 'critical'] as BugSeverity[]).map((s) => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, severity: s }))}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors', form.severity === s ? cn('border-transparent', SEVERITY_COLORS[s]) : 'border-border text-muted-foreground hover:text-foreground')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
