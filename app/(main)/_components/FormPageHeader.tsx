'use client';

import type { LucideIcon } from 'lucide-react';
import { BackButton } from '@/components/ui';
import type { IconTone } from './ListPageHeader';

const TONE_CLASS: Record<IconTone, string> = {
  primary: 'bg-primary/10 ring-primary/15 text-primary',
  success: 'bg-success/10 ring-success/20 text-success',
  warning: 'bg-warning/15 ring-warning/25 text-warning',
};

interface Props {
  backHref?: string;
  icon: LucideIcon;
  iconTone: IconTone;
  title: string;
  /** Optional subtitle rendered above the title (e.g. "Редактирование визита"). */
  kicker?: string;
  subtitleIcon?: LucideIcon;
  trailing?: React.ReactNode;
}

export function FormPageHeader({
  backHref,
  icon: Icon,
  iconTone,
  title,
  kicker,
  subtitleIcon: SubIcon,
  trailing,
}: Props) {
  const toneCls = TONE_CLASS[iconTone];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <BackButton href={backHref} />
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${toneCls}`}>
          <Icon size={kicker ? 15 : 16} />
        </div>
        <div className="min-w-0">
          {kicker && (
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {kicker}
            </p>
          )}
          <h2 className="flex min-w-0 items-center gap-1.5 truncate text-lg font-bold text-foreground md:text-xl">
            {SubIcon && <SubIcon size={15} className="shrink-0 text-muted-foreground" />}
            <span className="truncate">{title}</span>
          </h2>
        </div>
      </div>
      {trailing}
    </div>
  );
}
