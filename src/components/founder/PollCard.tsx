import { useState } from 'react';
import { FounderAvatar } from './FounderAvatar';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import type { IFounderPoll } from '@/types/founder';

interface PollCardProps {
  poll: IFounderPoll;
}

export function PollCard({ poll }: PollCardProps) {
  const [voted, setVoted] = useState(poll.hasVoted);
  const [selectedOption, setSelectedOption] = useState(poll.userVote || '');
  const [options, setOptions] = useState(poll.options);
  const [totalVotes, setTotalVotes] = useState(poll.totalVotes);

  const handleVote = (optionId: string) => {
    if (voted) return;
    setVoted(true);
    setSelectedOption(optionId);
    const newTotal = totalVotes + 1;
    setTotalVotes(newTotal);
    setOptions(options.map(opt => {
      const newCount = opt._id === optionId ? opt.voteCount + 1 : opt.voteCount;
      return { ...opt, voteCount: newCount, percentage: Math.round((newCount / newTotal) * 100) };
    }));
  };

  const isExpired = new Date(poll.endsAt) < new Date();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <FounderAvatar founder={poll.founder} size="sm" showName />
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full border',
          isExpired
            ? 'text-muted-foreground bg-secondary border-border'
            : 'text-primary bg-primary/10 border-primary/20'
        )}>
          {isExpired ? 'Ended' : 'Active Poll'}
        </span>
      </div>

      <h3 className="font-semibold text-base text-foreground mb-4 leading-snug">{poll.question}</h3>

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((option) => {
          const isSelected = selectedOption === option._id;
          const showResults = voted || isExpired;

          return (
            <button
              key={option._id}
              onClick={() => handleVote(option._id)}
              disabled={voted || isExpired}
              className={cn(
                'relative w-full text-left rounded-lg border overflow-hidden transition-all duration-200',
                showResults ? 'cursor-default' : 'hover:border-primary/40 cursor-pointer',
                isSelected
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-secondary/30'
              )}
            >
              {/* Progress fill */}
              {showResults && (
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-700 rounded-lg',
                    isSelected ? 'bg-primary/15' : 'bg-secondary/60'
                  )}
                  style={{ width: `${option.percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {/* Radio indicator */}
                  <div className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                    isSelected ? 'border-primary' : 'border-muted-foreground/40'
                  )}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <span className={cn('text-sm font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                    {option.text}
                  </span>
                </div>
                {showResults && (
                  <span className={cn('text-sm font-bold tabular-nums', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                    {option.percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{formatNumber(totalVotes)} votes</span>
        <span className="text-xs text-muted-foreground">
          {isExpired ? 'Poll ended' : `Ends ${formatRelativeTime(poll.endsAt)}`}
        </span>
      </div>
    </div>
  );
}
