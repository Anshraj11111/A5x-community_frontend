import { Map } from 'lucide-react';

export default function ProductJourneyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <Map className="h-8 w-8 text-indigo-400" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Product Journey</h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Follow along as we build A5X products from idea to release — coming soon.
      </p>
    </div>
  );
}
