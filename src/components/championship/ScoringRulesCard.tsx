import { Card } from '@/components/ui/card';

interface ScoringRulesCardProps {
  scoringRules: Record<string, number>;
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

export function ScoringRulesCard({ scoringRules }: ScoringRulesCardProps) {
  const entries = Object.entries(scoringRules).filter(([, pts]) => pts > 0);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Scoring Rules</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {entries.map(([action, pts]) => (
          <div
            key={action}
            className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs"
          >
            <span className="text-muted-foreground">
              {ACTION_LABELS[action] ?? action}
            </span>
            <span className="font-bold text-primary ml-2">+{pts}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
