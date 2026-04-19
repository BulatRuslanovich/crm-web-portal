'use client';

import { Building2, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import type { ActivResponse } from '@/lib/api/types';
import { DetailHero } from '@/app/(main)/_components/DetailHero';
import { StatusStepper } from '../../_components/StatusStepper';
import { statusAccentGradient } from '../../_lib/activ-format';

interface Props {
  activ: ActivResponse;
}

export function ActivHero({ activ }: Props) {
  const target = resolveTarget(activ);

  return (
    <DetailHero accentGradient={statusAccentGradient(activ.statusName)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card ring-1 ring-border">
            <target.Icon size={22} className="text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {target.kindLabel}
            </p>
            <h2 className="truncate text-xl font-bold text-foreground">{target.name ?? '—'}</h2>
          </div>
        </div>
        <StatusBadge name={activ.statusName} />
      </div>

      <div className="mt-5">
        <StatusStepper currentStatusId={activ.statusId} />
      </div>
    </DetailHero>
  );
}

interface Target {
  name: string | null;
  kindLabel: string;
  Icon: LucideIcon;
}

function resolveTarget(activ: ActivResponse): Target {
  const isPhys = activ.physId != null;
  return {
    name: isPhys ? activ.physName : activ.orgName,
    kindLabel: isPhys ? 'Врач' : 'Организация',
    Icon: isPhys ? Stethoscope : Building2,
  };
}
