import { useState } from 'react';
import { ArrowUp, CheckCircle } from 'lucide-react';
import { FounderAvatar } from './FounderAvatar';
import { UserAvatar } from '@/components/common/UserAvatar';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import type { IAMAQuestion } from '@/types/founder';

interface AMACardProps {
  question: IAMAQuestion;
}

export function AMACard({ question }: AMACardProps) {
  const [voted, setVoted] = useState(question.hasVoted);
  const [voteCount, setVoteCount] = useState(question.voteCount);

  const handleVote = () => {
    setVoted(!voted);
    setVoteCount(voted ? voteCount - 1 : voteCount + 1);
  };

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden transition-all duration-200',
      question.isAnswered
        ? 'border-primary/20 bg-primary/[0.02]'
        : 'border-border hover:border-border/80'
    )}>
      <div className="p-5">
        {/* Question */}
        <div className="flex gap-3">
          {/* Vote */}
          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
            <button
              onClick={handleVote}
              className={cn(
                'flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors',
                voted
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              )}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="text-xs font-bold tabular-nums">{formatNumber(voteCount)}</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <UserAvatar user={question.author} size="xs" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{question.author.displayName}</span>
                {' · '}{formatRelativeTime(question.createdAt)}
              </span>
              {question.isAnswered && (
                <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <CheckCircle className="h-3 w-3" /> Answered
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">{question.question}</p>
          </div>
        </div>

        {/* Answer */}
        {question.isAnswered && question.answer && question.answeredBy && (
          <div className="mt-4 ml-10 pl-4 border-l-2 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <FounderAvatar founder={question.answeredBy} size="sm" showName />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{question.answer}</p>
            {question.answeredAt && (
              <p className="text-xs text-muted-foreground mt-2">{formatRelativeTime(question.answeredAt)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
