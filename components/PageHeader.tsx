'use client';

import React from 'react';
import { BackButton } from '@/components/ui';

interface PageHeaderProps {
  title: string;
  kicker?: string;
  totalCount?: number;
  action?: React.ReactNode;
  backHref?: string;
}

export function PageHeader({ title, kicker, totalCount, action, backHref }: PageHeaderProps) {
  const hasBack = backHref !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasBack && <BackButton href={backHref} />}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0">
          {kicker && (
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              {kicker}
            </p>
          )}
          <h2
            className={`text-foreground flex min-w-0 items-center gap-1.5 truncate font-bold ${
              hasBack ? 'text-lg md:text-xl' : 'text-xl'
            }`}
          >
            <span className="truncate">{title}</span>
          </h2>
          {totalCount !== undefined && (
            <p className="text-muted-foreground text-xs">
              Всего: <span className="text-foreground font-semibold">{totalCount}</span>
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
