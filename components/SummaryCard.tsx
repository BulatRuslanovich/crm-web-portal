import { ToneIcon } from '@/components/ToneIcon';
import type { Tone } from '@/lib/tone';
import React from 'react';

export function SummaryCard({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: Tone;
  hint?: string;
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <ToneIcon icon={icon} tone={tone} size="sm" />
      </div>
      <p className="text-foreground text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
      {hint && <p className="text-muted-foreground/70 mt-1 text-[10px]">{hint}</p>}
    </div>
  );
}
