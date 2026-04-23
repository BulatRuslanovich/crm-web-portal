'use client';

import React from 'react';

interface Props {
  accentGradient: string;
  children: React.ReactNode;
}

export function DetailHero({ accentGradient, children }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accentGradient}`}
        aria-hidden
      />
      <div className="relative p-5">{children}</div>
    </div>
  );
}
