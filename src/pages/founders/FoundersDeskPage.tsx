import { Zap } from 'lucide-react';

export default function FoundersDeskPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/20">
          <Zap className="h-8 w-8 text-[#00FF88]" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Founder's Desk</h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Direct posts from the A5X founders — roadmap updates, AMAs, and behind-the-scenes. Coming soon.
      </p>
    </div>
  );
}
