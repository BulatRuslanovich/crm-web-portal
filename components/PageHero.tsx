'use client';

import type { LucideIcon } from 'lucide-react';
import React from 'react';

type Tone = 'primary' | 'success' | 'warning';

const TONE: Record<Tone, { gradient: string; icon: string }> = {
  primary: {
    gradient: 'from-primary/5 via-muted to-card',
    icon: 'bg-primary/10 ring-primary/20 text-primary',
  },
  success: {
    gradient: 'from-success/10 via-muted to-card',
    icon: 'bg-success/10 ring-success/20 text-success',
  },
  warning: {
    gradient: 'from-warning/10 via-muted to-card',
    icon: 'bg-warning/15 ring-warning/25 text-warning',
  },
};

interface Props {
  icon: LucideIcon;
  kicker: string;
  title: string;
  subtitle?: React.ReactNode;
  tone: Tone;
  action?: React.ReactNode;
}

export function PageHero({ icon: Icon, kicker, title, subtitle, tone, action }: Props) {
  const t = TONE[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${t.gradient} shadow-sm`}>
      <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${t.icon}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {kicker}
            </p>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
            )}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
