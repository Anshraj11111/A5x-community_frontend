import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserAvatar } from '@/components/common/UserAvatar';
import { InlineLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { featureService } from '@/services/featureService';
import { useToast } from '@/store/uiStore';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import type { IFeatureRequest } from '@/types';

const STATUS_LABELS: Record<string, string> = { '': 'All', open: 'Open', under_review: 'Under Review', planned: 'Planned', in_development: 'In Development', released: 'Released', rejected: 'Rejected' };
const STATUS_COLORS: Record<string, string> = { open: 'text-primary bg-primary/10', under_review: 'text-yellow-400 bg-yellow-400/10', planned: 'text-blue-400 bg-blue-400/10', in_development: 'text-purple-400 bg-purple-400/10', released: 'text-primary bg-primary/10', rejected: 'text-red-400 bg-red-400/10' };

export default function FeaturesPage() {
  const { isAuthenticated } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('votes');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FEATURES, { status, sort, search }],
    queryFn: () => featureService.getFeatures({ status: status || undefined, sort, search: search || undefined, limit: 30 }),
  });

  const handleVote = async (id: string) => {
    if (!isAuthenticated) { error('Sign in to vote'); return; }
    try { await featureService.voteFeature(id); queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURES] }); }
    catch { /* handled */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await featureService.createFeature({ title: form.title, description: form.description });
      success('Feature request submitted');
      setShowCreate(false);
      setForm({ title: '', description: '' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURES] });
    } catch (err: unknown) {
      error((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Vote on features you want to see in A5X products</p>
        </div>
        {isAuthenticated && <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Request Feature</Button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search features..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-9 rounded-lg border border-border bg-secondary px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {['votes', 'latest'].map((s) => (
            <Button key={s} variant="ghost" size="sm" className={cn('h-7 px-3 text-xs rounded-md capitalize', sort === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')} onClick={() => setSort(s)}>{s}</Button>
          ))}
        </div>
      </div>

      {isLoading ? <InlineLoader /> : data?.data.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No feature requests yet" description="Be the first to suggest a feature"
          action={isAuthenticated ? <Button size="sm" onClick={() => setShowCreate(true)}>Request a Feature</Button> : undefined} />
      ) : (
        <div className="space-y-3">
          {data?.data.map((feature: IFeatureRequest) => (
            <Card key={feature._id} className="p-5 transition-all duration-200 hover:border-border/80 hover:bg-secondary/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className={cn('h-9 w-9 rounded-lg', feature.hasVoted ? 'text-primary bg-primary/10' : 'text-muted-foreground')} onClick={() => handleVote(feature._id)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className={cn('text-sm font-bold tabular-nums', feature.hasVoted ? 'text-primary' : 'text-muted-foreground')}>{formatNumber(feature.voteCount)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug">{feature.title}</h3>
                    <Badge className={cn('text-[10px] shrink-0', STATUS_COLORS[feature.status] || '')}>{STATUS_LABELS[feature.status] || feature.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{feature.description}</p>
                  {feature.adminNote && (
                    <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-primary font-medium">A5X Team Note</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{feature.adminNote}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <UserAvatar user={feature.author} size="xs" />
                    <span className="text-xs text-muted-foreground">{feature.author.displayName} · {formatRelativeTime(feature.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Feature</DialogTitle>
            <DialogDescription>Describe the feature you'd like to see in A5X products</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Short, clear title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required minLength={5} maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe the feature in detail..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="min-h-[120px]" required minLength={20} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
