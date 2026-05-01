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
        <div className="bg-muted text-muted-foreground mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
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
    <div className="border-border bg-muted/30 flex items-center gap-3 rounded-xl border px-4 py-3">
      <div className="bg-card ring-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1">
        <Icon size={15} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          {label}
        </p>
        {value ? (
          <p className="text-foreground text-sm font-semibold">
            {value.date}
            <span className="text-muted-foreground ml-1.5 font-mono">{value.time}</span>
          </p>
        ) : (
          <p className="text-muted-foreground/70 text-sm">—</p>
        )}
      </div>
    </div>
  );
}
