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
    <div className="border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm">
      <ToneIcon icon={icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <p className="text-foreground text-lg font-bold tracking-tight tabular-nums">{value}</p>
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}
