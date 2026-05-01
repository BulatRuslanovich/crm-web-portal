'use client';

import Link from 'next/link';
import { Building2, Stethoscope, Pill, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { MONTHS_ABBR, WEEKDAYS_SHORT } from '@/lib/ru-dates';
import type { ActivResponse } from '@/lib/api/types';
import React from 'react';
import { statusStripeClass } from '@/lib/activ-helper';

interface Props {
  activ: ActivResponse;
  first: boolean;
}

export function ActivRow({ activ, first }: Props) {
  const target = resolveTarget(activ);
  const dateParts = resolveDateParts(activ.start);

  return (
    <Link
      href={`/activs/${activ.activId}`}
      className={`group relative flex items-stretch gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 ${
        first ? '' : 'border-t border-border'
      }`}
    >
      <span
        className={`absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full ${statusStripeClass(activ.statusName)} opacity-70 transition-opacity group-hover:opacity-100`}
      />
      <DateBlock {...dateParts} />
      <ActivMeta activ={activ} target={target} time={dateParts.time} />
      <div className="flex shrink-0 items-center">
        <StatusBadge name={activ.statusName} />
      </div>
    </Link>
  );
}

function DateBlock({ day, month, weekday }: DateParts) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/60 py-1.5">
      <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
        {weekday}
      </span>
      <span className="text-lg leading-none font-bold text-foreground">{day}</span>
      <span className="text-[10px] text-muted-foreground/80">{month}</span>
    </div>
  );
}

function ActivMeta({
  activ,
  target,
  time,
}: {
  activ: ActivResponse;
  target: { name: string | null; Icon: React.ElementType };
  time: string;
}) {
  const { Icon } = target;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon size={13} className="text-muted-foreground/70 shrink-0" />
        <p className="text-foreground truncate text-sm font-semibold">{target.name ?? '—'}</p>
      </div>
      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {time && <span className="text-foreground/80 font-medium tabular-nums">{time}</span>}
        {time && <span className="bg-muted-foreground/40 h-1 w-1 rounded-full" />}
        <span className="flex items-center gap-1">
          <User size={11} />
          {activ.usrLogin}
        </span>
        {activ.drugs.length > 0 && (
          <>
            <span className="bg-muted-foreground/40 h-1 w-1 rounded-full" />;
            <span className="flex items-center gap-1">
              <Pill size={11} />
              {activ.drugs.length}
            </span>
          </>
        )}
      </div>
      {activ.description && (
        <p className="text-muted-foreground/80 mt-1 line-clamp-1 text-xs">{activ.description}</p>
      )}
    </div>
  );
}

function resolveTarget(activ: ActivResponse) {
  const isPhys = activ.physId != null;
  return {
    name: isPhys ? activ.physName : activ.orgName,
    Icon: isPhys ? Stethoscope : Building2,
  };
}

interface DateParts {
  day: string;
  month: string;
  weekday: string;
  time: string;
}

function resolveDateParts(iso: string | null): DateParts {
  if (!iso) return { day: '—', month: '', weekday: '', time: '' };
  const d = new Date(iso);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: MONTHS_ABBR[d.getMonth()],
    weekday: WEEKDAYS_SHORT[d.getDay()],
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}
