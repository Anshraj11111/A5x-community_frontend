import * as Tooltip from '@radix-ui/react-tooltip';

interface ScoreBreakdownBarProps {
  breakdown: Record<string, number>;
  totalScore: number;
}

const ACTION_LABELS: Record<string, string> = {
  post: 'Post',
  comment: 'Comment',
  upvoteReceived: 'Upvote Received',
  showcasePost: 'Showcase Post',
  featureRequest: 'Feature Request',
  bugReport: 'Bug Report',
  pollCreated: 'Poll Created',
};

const COLORS = [
  'bg-primary',
  'bg-blue-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
];

export function ScoreBreakdownBar({ breakdown, totalScore }: ScoreBreakdownBarProps) {
  const entries = Object.entries(breakdown).filter(([, v]) => v > 0);

  if (totalScore === 0 || entries.length === 0) {
    return (
      <div className="h-2 w-full rounded-full bg-secondary" />
    );
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {entries.map(([action, pts], i) => {
          const pct = (pts / totalScore) * 100;
          return (
            <Tooltip.Root key={action}>
              <Tooltip.Trigger asChild>
                <div
                  className={`${COLORS[i % COLORS.length]} h-full cursor-pointer transition-opacity hover:opacity-80`}
                  style={{ width: `${pct}%` }}
                />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="rounded-md bg-popover border border-border px-2.5 py-1.5 text-xs shadow-md"
                  sideOffset={4}
                >
                  <span className="font-medium">{ACTION_LABELS[action] ?? action}:</span>{' '}
                  <span className="text-primary font-bold">{pts} pts</span>
                  <Tooltip.Arrow className="fill-border" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
