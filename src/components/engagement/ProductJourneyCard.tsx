import { useState } from 'react';
import { Bell, BellOff, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { IProductJourney, JourneyStage, IJourneyMilestone } from '@/types/engagement';

const STAGES: { id: JourneyStage; label: string; icon: string }[] = [
  { id: 'idea',       label: 'Idea',       icon: '💡' },
  { id: 'research',   label: 'Research',   icon: '🔬' },
  { id: 'design',     label: 'Design',     icon: '🎨' },
  { id: 'prototype',  label: 'Prototype',  icon: '🔧' },
  { id: 'testing',    label: 'Testing',    icon: '🧪' },
  { id: 'production', label: 'Production', icon: '🏭' },
  { id: 'released',   label: 'Released',   icon: '🚀' },
];

const STAGE_ORDER: Record<JourneyStage, number> = {
  idea: 0, research: 1, design: 2, prototype: 3, testing: 4, production: 5, released: 6,
};

interface MilestoneItemProps {
  milestone: IJourneyMilestone;
  isActive: boolean;
  isCompleted: boolean;
}

function MilestoneItem({ milestone, isActive, isCompleted }: MilestoneItemProps) {
  const [expanded, setExpanded] = useState(isActive);
  const stage = STAGES.find(s => s.id === milestone.stage);

  return (
    <div className="flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm shrink-0 z-10',
          isCompleted
            ? 'border-primary bg-primary/10 text-primary'
            : isActive
            ? 'border-primary bg-primary text-black animate-pulse'
            : 'border-border bg-secondary text-muted-foreground'
        )}>
          {isCompleted ? '✓' : stage?.icon}
        </div>
        <div className={cn('w-0.5 flex-1 mt-1', isCompleted ? 'bg-primary/30' : 'bg-border')} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <button
          className="w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                isCompleted ? 'text-primary' : isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {stage?.label}
              </span>
              <h4 className={cn('text-sm font-semibold mt-0.5', isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground')}>
                {milestone.title}
              </h4>
            </div>
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          </div>
        </button>

        {expanded && (
          <div className="mt-2 space-y-2 animate-fade-in">
            <p className="text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
            {milestone.founderNote && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-semibold text-primary mb-1">Founder Note</p>
                <p className="text-xs text-muted-foreground italic">"{milestone.founderNote}"</p>
              </div>
            )}
            {milestone.images.length > 0 && (
              <div className="flex gap-2">
                {milestone.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="h-20 w-32 object-cover rounded-lg border border-border" />
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              {new Date(milestone.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductJourneyCardProps {
  journey: IProductJourney;
}

export function ProductJourneyCard({ journey }: ProductJourneyCardProps) {
  const [following, setFollowing] = useState(journey.isFollowing);
  const [followerCount, setFollowerCount] = useState(journey.followers);
  const currentStageIndex = STAGE_ORDER[journey.currentStage];
  const progressPct = Math.round((currentStageIndex / (STAGES.length - 1)) * 100);

  const handleFollow = () => {
    setFollowing(!following);
    setFollowerCount(following ? followerCount - 1 : followerCount + 1);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Cover */}
      <div className="relative h-32 overflow-hidden">
        <img src={journey.coverImage} alt={journey.productName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{journey.productName}</h2>
            <p className="text-xs text-muted-foreground">{journey.description}</p>
          </div>
          <button
            onClick={handleFollow}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0',
              following
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-background/80 border-border text-muted-foreground hover:text-primary hover:border-primary/30'
            )}
          >
            {following ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary capitalize">{journey.currentStage}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {formatNumber(followerCount)} following
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {STAGES.map((stage, i) => (
              <div
                key={stage.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-500',
                  i <= currentStageIndex ? 'bg-primary' : 'bg-secondary'
                )}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {STAGES.map((stage, i) => (
              <span key={stage.id} className={cn(
                'text-[9px]',
                i <= currentStageIndex ? 'text-primary' : 'text-muted-foreground/40'
              )}>
                {stage.icon}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline milestones */}
        <div>
          {journey.milestones.map((milestone) => {
            const mStageIndex = STAGE_ORDER[milestone.stage];
            const isCompleted = milestone.isCompleted;
            const isActive = milestone.stage === journey.currentStage && !isCompleted;
            return (
              <MilestoneItem
                key={milestone._id}
                milestone={milestone}
                isActive={isActive}
                isCompleted={isCompleted}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
