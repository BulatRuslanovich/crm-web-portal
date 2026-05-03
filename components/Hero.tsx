'use client';

import React from 'react';

type Tone = 'primary' | 'success' | 'warning';

const TONE_GRADIENT: Record<Tone, string> = {
  primary: 'from-primary/5 via-muted to-card',
  success: 'from-success/10 via-muted to-card',
  warning: 'from-warning/10 via-muted to-card',
};

interface HeroProps {
  kicker?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  tone?: Tone;
  accentGradient?: string;
  children?: React.ReactNode;
}

export function Hero({
  kicker,
  title,
  subtitle,
  action,
  tone = 'primary',
  accentGradient,
  children,
}: HeroProps) {
  if (accentGradient) {
    return (
      <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-sm">
        <div
          className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accentGradient}`}
          aria-hidden
        />
        <div className="relative p-5">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br ${TONE_GRADIENT[tone]} shadow-sm`}
    >
      <div className="relative flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div>
            {kicker && (
              <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                {kicker}
              </p>
            )}
            {title && <h2 className="text-foreground text-xl font-bold">{title}</h2>}
            {subtitle && <div className="text-muted-foreground mt-0.5 text-xs">{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
