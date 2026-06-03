import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Trash2, Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

// Post schema: title (min 5), content (min 10), type: announcement|discussion|question
const EMPTY_FORM = { title: '', content: '', type: 'announcement' as const, tags: ['event'] };

export default function AdminEventsPage() {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data } = await api.get('/posts', {
        params: { tag: 'event', type: 'announcement', limit: 20 },
      });
      return data;
    },
  });

  const events = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { data } = await api.post('/posts', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      success('Event created');
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || 'Failed to create event';
      toastError(msg);
    },
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => api.post(`/posts/${id}/pin`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      success('Pin toggled');
    },
    onError: () => toastError('Failed to pin event'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      success('Event deleted');
    },
    onError: () => toastError('Failed to delete event'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Events</h1>
          <p className="text-sm text-[#666] mt-0.5">Community events and announcements</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}
          className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5">
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Cancel' : 'New Event'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[#00FF88]/20 bg-[#0d0d0d] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Create Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Title <span className="text-red-400">*</span></label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. AMA with Founders — Jan 15" required minLength={5}
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444]" />
              {form.title.length > 0 && form.title.length < 5 && (
                <p className="text-[10px] text-red-400">Minimum 5 characters ({form.title.length}/5)</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Description <span className="text-red-400">*</span></label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Event details, date/time, how to join..." required minLength={10}
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444] min-h-[100px]" />
              {form.content.length > 0 && form.content.length < 10 && (
                <p className="text-[10px] text-red-400">Minimum 10 characters ({form.content.length}/10)</p>
              )}
            </div>
            <Button type="submit" size="sm"
              disabled={createMutation.isPending || form.title.length < 5 || form.content.length < 10}
              className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center text-sm text-red-400">
          Failed to load events.
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <Calendar className="h-8 w-8 text-[#444] mx-auto mb-3" />
          <p className="text-sm text-white mb-1">No events yet</p>
          <p className="text-xs text-[#666]">Create an event to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event: any) => (
            <div key={event._id}
              className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10 shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                      {event.isPinned && (
                        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded">PINNED</span>
                      )}
                    </div>
                    <p className="text-xs text-[#666] line-clamp-2">{event.content}</p>
                    <p className="text-[10px] text-[#444] mt-1.5">
                      {event.author?.displayName ?? 'Unknown'} · {formatRelativeTime(event.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => pinMutation.mutate(event._id)} disabled={pinMutation.isPending}
                    className={cn('p-1.5 rounded-lg transition-colors',
                      event.isPinned ? 'text-yellow-400 bg-yellow-400/10' : 'text-[#444] hover:text-yellow-400 hover:bg-yellow-400/10'
                    )} title={event.isPinned ? 'Unpin' : 'Pin'}>
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(event._id); }}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
