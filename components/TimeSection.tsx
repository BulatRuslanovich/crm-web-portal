'use client';

import { CalendarDays, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionLabel } from '@/components/ui';
import { type DateTimeParts, formatDateTime, formatDuration } from '@/lib/activ-helper';

interface Props {
  start: string | null;
  end: string | null;
}

export function TimeSection({ start, end }: Props) {
  const startFmt = formatDateTime(start);
  const endFmt = formatDateTime(end);
  const duration = formatDuration(start, end);

  return (
    <div>
      <SectionLabel icon={Clock}>Время визита</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TimeBlock label="Начало" icon={CalendarDays} value={startFmt} />
        <TimeBlock label="Окончание" icon={CalendarDays} value={endFmt} />
      </div>
      {duration && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Clock size={11} />
          Длительность: {duration}
        </div>
      )}
    </div>
  );
}

function TimeBlock({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: LucideIcon;
  value: DateTimeParts | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
        <Icon size={15} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        {value ? (
          <p className="text-sm font-semibold text-foreground">
            {value.date}
            <span className="ml-1.5 font-mono text-muted-foreground">{value.time}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/70">—</p>
        )}
      </div>
    </div>
  );
}
