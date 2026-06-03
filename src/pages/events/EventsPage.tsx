import { Calendar } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <Calendar className="h-8 w-8 text-blue-400" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Events</h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Community events, AMAs, workshops, and hackathons — coming soon.
      </p>
    </div>
  );
}
