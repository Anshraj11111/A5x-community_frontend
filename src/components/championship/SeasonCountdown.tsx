import { useEffect, useState } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

interface SeasonCountdownProps {
  endDate: string;
}

function pad(n: number | undefined): string {
  return String(n ?? 0).padStart(2, '0');
}

export function SeasonCountdown({ endDate }: SeasonCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, differenceInSeconds(new Date(endDate), new Date()))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(Math.max(0, differenceInSeconds(new Date(endDate), new Date())));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (secondsLeft <= 0) {
    return (
      <span className="text-sm text-muted-foreground font-medium">Season ended</span>
    );
  }

  const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'D', value: pad(duration.days) },
        { label: 'H', value: pad(duration.hours) },
        { label: 'M', value: pad(duration.minutes) },
        { label: 'S', value: pad(duration.seconds) },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center min-w-[2.5rem] bg-secondary rounded-lg px-2 py-1"
        >
          <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}
