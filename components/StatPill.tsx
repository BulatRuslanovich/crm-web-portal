import { ToneIcon } from '@/components/ToneIcon';
import type { Tone } from '@/lib/tone';
import React from 'react';

export function StatPill({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: Tone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <ToneIcon icon={icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <p className="text-lg font-bold tracking-tight text-foreground tabular-nums">{value}</p>
        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}
