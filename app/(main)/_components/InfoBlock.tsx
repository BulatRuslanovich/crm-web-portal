'use client';

import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface Props {
  label: string;
  icon?: LucideIcon;
  value?: React.ReactNode;
  mono?: boolean;
  href?: string;
}

const BASE_CLASS =
  'flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3';

export function InfoBlock({ label, icon: Icon, value, mono, href }: Props) {
  const inner = <InfoBlockInner label={label} icon={Icon} value={value} mono={mono} />;

  if (href && value) {
    return (
      <a
        href={href}
        className={`${BASE_CLASS} transition-colors hover:border-primary/30 hover:bg-muted/60`}
      >
        {inner}
      </a>
    );
  }
  return <div className={BASE_CLASS}>{inner}</div>;
}

function InfoBlockInner({ label, icon: Icon, value, mono }: Props) {
  return (
    <>
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
          <Icon size={14} className="text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p
          className={`text-sm leading-relaxed break-words text-foreground ${
            mono ? 'font-mono tabular-nums' : ''
          }`}
        >
          {value || <span className="text-muted-foreground/70">—</span>}
        </p>
      </div>
    </>
  );
}
