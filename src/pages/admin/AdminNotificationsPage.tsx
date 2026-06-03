import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, Send, Users, Zap, Trophy, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/store/uiStore';
import api from '@/services/api';

const AUDIENCE_TYPES = [
  { id: 'all',       label: 'All Users',       icon: Bell,     color: 'text-[#00FF88]',  desc: 'Broadcast to every user' },
  { id: 'founder',   label: "Founder's Desk",  icon: Zap,      color: 'text-[#00FF88]',  desc: 'Founder post activity' },
  { id: 'challenge', label: 'Challenge',        icon: Trophy,   color: 'text-yellow-400', desc: 'Challenge updates' },
  { id: 'event',     label: 'Event',            icon: Calendar, color: 'text-blue-400',   desc: 'Event reminders' },
  { id: 'club',      label: 'Club',             icon: Users,    color: 'text-purple-400', desc: 'Club announcements' },
] as const;

type AudienceId = typeof AUDIENCE_TYPES[number]['id'];

const EMPTY_FORM = { title: '', message: '', target: '' };

export default function AdminNotificationsPage() {
  const { success, error: toastError } = useToast();
  const [audience, setAudience] = useState<AudienceId>('all');
  const [form, setForm] = useState(EMPTY_FORM);
  const [lastSent, setLastSent] = useState<{ title: string; count: number } | null>(null);

  const broadcastMutation = useMutation({
    mutationFn: async (payload: { title: string; message: string }) => {
      const { data } = await api.post('/admin/notifications/broadcast', payload);
      return data;
    },
    onSuccess: (data) => {
      const count = data?.data?.sent ?? 0;
      setLastSent({ title: form.title, count });
      success(`Broadcast sent to ${count} users`);
      setForm(EMPTY_FORM);
    },
    onError: () => toastError('Failed to send notification. Admin role required.'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    // Only "all" actually hits the backend broadcast; others are UI-only for now
    if (audience === 'all') {
      broadcastMutation.mutate({ title: form.title, message: form.message });
    } else {
      success(`Notification queued for ${AUDIENCE_TYPES.find(a => a.id === audience)?.desc}`);
      setForm(EMPTY_FORM);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Notification Center</h1>
        <p className="text-sm text-[#666] mt-0.5">Send targeted notifications to community members</p>
      </div>

      {/* Audience selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {AUDIENCE_TYPES.map(({ id, label, icon: Icon, color, desc }) => (
          <button
            key={id}
            onClick={() => setAudience(id)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center',
              audience === id
                ? 'border-[#00FF88]/30 bg-[#00FF88]/5'
                : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'
            )}>
            <Icon className={cn('h-5 w-5', audience === id ? color : 'text-[#444]')} />
            <span className={cn('text-xs font-medium leading-tight', audience === id ? 'text-white' : 'text-[#444]')}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Notice for non-broadcast audiences */}
      {audience !== 'all' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/10">
          <span className="text-xs text-yellow-400">
            ⚠️ Targeted notifications (founder / challenge / event / club) require Socket.IO rooms — currently queued locally only.
          </span>
        </div>
      )}

      {/* Compose */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Compose Notification</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888]">Title</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Notification title..."
              required
              className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444] focus-visible:ring-[#00FF88]/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888]">Message</label>
            <Textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Notification message..."
              required
              className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444] min-h-[100px] focus-visible:ring-[#00FF88]/30"
            />
          </div>
          {audience === 'club' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888]">Club Slug</label>
              <Input
                value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                placeholder="rc-bot-club"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#444]"
              />
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#444]">
              Sending to:{' '}
              <span className="text-[#00FF88]">
                {AUDIENCE_TYPES.find(a => a.id === audience)?.desc}
              </span>
            </p>
            <Button
              type="submit"
              size="sm"
              disabled={broadcastMutation.isPending}
              className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90 gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {broadcastMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      </div>

      {/* Success confirmation */}
      {lastSent && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#00FF88]/20 bg-[#00FF88]/5">
          <CheckCircle className="h-5 w-5 text-[#00FF88] shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">
              "{lastSent.title}" sent successfully
            </p>
            <p className="text-xs text-[#00FF88] mt-0.5">{lastSent.count} users notified</p>
          </div>
        </div>
      )}

      {/* Recent sent (static preview — backend audit log would power this in production) */}
      <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Recently Sent</h2>
        <div className="space-y-1">
          {[
            { title: 'AMA Session Tomorrow',          audience: 'all',       time: '2h ago',  reach: '5,247' },
            { title: 'RC Bot Challenge — 3 days left', audience: 'challenge', time: '1d ago',  reach: '234' },
            { title: 'New Founder Post',               audience: 'founder',   time: '2d ago',  reach: '4,891' },
          ].map((n, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-[#111] last:border-0">
              <div>
                <p className="text-xs text-white">{n.title}</p>
                <p className="text-[10px] text-[#444] capitalize">{n.audience} · {n.time}</p>
              </div>
              <span className="text-xs text-[#00FF88]">{n.reach} reached</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
