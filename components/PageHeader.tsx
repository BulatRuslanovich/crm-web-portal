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
    <div className="flex flex-wrap items-center gap-3">
      {hasBack && <BackButton href={backHref} />}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0">
          {kicker && (
            <p className="text-muted-foreground/80 text-[10px] font-semibold tracking-[0.14em] uppercase">
              {kicker}
            </p>
          )}
          <h2
            className={`text-foreground flex min-w-0 items-center gap-1.5 truncate font-semibold tracking-tight ${
              hasBack ? 'text-lg md:text-xl' : 'text-2xl'
            }`}
          >
            <span className="truncate">{title}</span>
          </h2>
          {totalCount !== undefined && (
            <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
              Всего{' '}
              <span className="text-foreground/90 font-medium">
                {totalCount.toLocaleString('ru-RU')}
              </span>
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
