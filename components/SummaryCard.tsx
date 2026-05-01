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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <ToneIcon icon={icon} tone={tone} size="sm" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
