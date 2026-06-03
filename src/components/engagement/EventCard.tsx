import { useState } from 'react';
import { Calendar, Users, Video, MapPin, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatNumber } from '@/lib/utils';
import type { ICommunityEvent, EventType } from '@/types/engagement';

interface EventCardProps {
  event: ICommunityEvent;
}

const TYPE_CONFIG: Record<EventType, { label: string; icon: string; color: string }> = {
  ama:            { label: 'AMA Session',      icon: '🎤', color: 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20' },
  launch:         { label: 'Product Launch',   icon: '🚀', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  webinar:        { label: 'Webinar',          icon: '📡', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  meetup:         { label: 'Meetup',           icon: '🤝', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  workshop:       { label: 'Workshop',         icon: '🛠️', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  hackathon:      { label: 'Hackathon',        icon: '⚡', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  community_call: { label: 'Community Call',   icon: '📞', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
};

function formatEventDate(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const startTime = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTime = e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${startTime} – ${endTime}`;
}

function getCountdown(startDate: string): string {
  const diff = new Date(startDate).getTime() - Date.now();
  if (diff <= 0) return '';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `in ${days}d ${hours}h`;
  return `in ${hours}h`;
}

export function EventCard({ event }: EventCardProps) {
  const [registered, setRegistered] = useState(event.isRegistered);
  const typeConfig = TYPE_CONFIG[event.type];
  const countdown = getCountdown(event.startDate);
  const isFull = event.maxAttendees ? event.attendeeCount >= event.maxAttendees : false;

  return (
    <div className={cn(
      'rounded-2xl border bg-card overflow-hidden transition-all duration-200',
      event.isPast ? 'border-border opacity-80' : 'border-border hover:border-border/80'
    )}>
      {/* Cover */}
      <div className={cn('h-20 bg-gradient-to-br relative flex items-center px-5 gap-3', event.coverColor)}>
        <span className="text-3xl">{typeConfig.icon}</span>
        <div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', typeConfig.color)}>
            {typeConfig.label}
          </span>
          {!event.isPast && countdown && (
            <p className="text-xs text-foreground font-medium mt-1">{countdown}</p>
          )}
        </div>
        {event.isPast && (
          <div className="absolute top-2 right-3 text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
            Past Event
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-sm text-foreground leading-snug mb-3">{event.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{event.description}</p>

        {/* Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatEventDate(event.startDate, event.endDate)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {event.isOnline ? <Video className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
            {event.isOnline ? 'Online Event' : event.location}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {formatNumber(event.attendeeCount)} attending
            {event.maxAttendees && ` · ${event.maxAttendees - event.attendeeCount} spots left`}
          </div>
        </div>

        {/* Host */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-secondary/50 border border-border">
          <img src={event.host.avatar} alt={event.host.name} className="h-6 w-6 rounded-full" />
          <div>
            <span className="text-xs font-medium text-foreground">{event.host.name}</span>
            <span className="text-[10px] text-muted-foreground ml-1">· {event.host.role}</span>
          </div>
        </div>

        {/* Action */}
        {event.isPast ? (
          event.recordingUrl ? (
            <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5" asChild>
              <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer">
                <Play className="h-3.5 w-3.5" /> Watch Recording
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="w-full text-xs h-8" disabled>
              Recording Coming Soon
            </Button>
          )
        ) : (
          <Button
            size="sm"
            variant={registered ? 'outline' : 'default'}
            className="w-full text-xs h-8"
            disabled={isFull && !registered}
            onClick={() => setRegistered(!registered)}
          >
            {registered ? 'Registered ✓' : isFull ? 'Event Full' : 'Register Now'}
          </Button>
        )}
      </div>
    </div>
  );
}
