'use client';

import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  totalCount?: number;
  iconTone: IconTone;
  action?: React.ReactNode;
}

export type IconTone = 'primary' | 'success' | 'warning';

const TONE_CLASS: Record<IconTone, string> = {
  primary: 'bg-primary/10 ring-primary/15 text-primary',
  success: 'bg-success/10 ring-success/20 text-success',
  warning: 'bg-warning/15 ring-warning/25 text-warning',
};

export function ListPageHeader({ icon: Icon, title, totalCount, iconTone, action }: Props) {
  const toneCls = TONE_CLASS[iconTone];
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${toneCls}`}>
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {totalCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              Всего: <span className="font-semibold text-foreground">{totalCount}</span>
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
