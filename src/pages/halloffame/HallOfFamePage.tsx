import { Crown } from 'lucide-react';

export default function HallOfFamePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <Crown className="h-8 w-8 text-orange-400" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Hall of Fame</h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Top community contributors leaderboard — coming soon.
      </p>
    </div>
  );
}
