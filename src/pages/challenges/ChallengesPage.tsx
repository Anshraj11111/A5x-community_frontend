import { Trophy } from 'lucide-react';

export default function ChallengesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <Trophy className="h-8 w-8 text-yellow-400" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Challenges</h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Community challenges are coming soon. Compete, build, and win prizes.
      </p>
    </div>
  );
}
