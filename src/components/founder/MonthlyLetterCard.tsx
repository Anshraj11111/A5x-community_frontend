import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lightbulb, Star } from 'lucide-react';
import { FounderAvatar } from './FounderAvatar';
import { cn } from '@/lib/utils';
import type { IMonthlyLetter } from '@/types/founder';

interface MonthlyLetterCardProps {
  letter: IMonthlyLetter;
}

export function MonthlyLetterCard({ letter }: MonthlyLetterCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-card overflow-hidden">
      {/* Header banner */}
      <div className="px-6 py-4 border-b border-indigo-500/10 bg-indigo-500/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Monthly Letter</span>
        </div>
        <h2 className="text-lg font-bold text-foreground">{letter.month} {letter.year}</h2>
        <p className="text-sm text-muted-foreground mt-0.5 italic">"{letter.subject}"</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Author */}
        <FounderAvatar founder={letter.founder} size="md" showName />

        {/* Intro */}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {letter.content}
        </p>

        {/* Expandable sections */}
        {expanded && (
          <div className="space-y-5 animate-fade-in">
            {/* Achievements */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
              </div>
              <ul className="space-y-2">
                {letter.achievements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Learnings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-foreground">What We Learned</h3>
              </div>
              <ul className="space-y-2">
                {letter.learnings.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-yellow-400 mt-0.5 shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Future Plans */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-foreground">What's Next</h3>
              </div>
              <ul className="space-y-2">
                {letter.futurePlans.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-blue-400 mt-0.5 shrink-0">◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Highlight */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary">Community Highlight</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{letter.communityHighlight}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-4 w-4" /> Collapse letter</>
          ) : (
            <><ChevronDown className="h-4 w-4" /> Read full letter</>
          )}
        </button>
      </div>
    </div>
  );
}
