'use client';

import React from 'react';

type Tone = 'primary' | 'success' | 'warning';

const TONE_RAIL: Record<Tone, string> = {
  primary: 'via-primary/40',
  success: 'via-success/40',
  warning: 'via-warning/40',
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
      <div className="border-border bg-card relative overflow-hidden rounded-2xl border">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r ${accentGradient}`}
          aria-hidden
        />
        <div className="relative p-6 sm:p-7">{children}</div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-2xl border">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${TONE_RAIL[tone]} to-transparent`}
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start justify-between gap-6 p-6 sm:p-7">
        <div className="min-w-0">
          {kicker && (
            <p className="text-muted-foreground/80 text-[10px] font-semibold tracking-[0.14em] uppercase">
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="text-foreground mt-1 text-[22px] leading-tight font-semibold tracking-tight sm:text-2xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <div className="text-muted-foreground mt-1.5 text-xs tabular-nums">{subtitle}</div>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
