import Link from 'next/link';
import { CalendarDays, Plus, X, User, Building2, Stethoscope } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { STATUS_HEX } from '@/lib/api/statuses';
import { StatusBadge } from '@/components/ui';
import { fmtHM } from '@/lib/date';
import { MONTHS_GEN } from '@/lib/ru-dates';

const DEFAULT_COLOR = '#94a3b8';

function VisitRow({ activ, withBorder }: { activ: ActivResponse; withBorder: boolean }) {
  const isPhys = activ.physId != null;
  const TargetIcon = isPhys ? Stethoscope : Building2;
  const color = STATUS_HEX[activ.statusName.toLowerCase()] ?? DEFAULT_COLOR;
  const time = activ.start ? fmtHM(new Date(activ.start)) : '—';

  return (
    <Link
      href={`/activs/${activ.activId}`}
      className={`group relative flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/60 ${
        withBorder ? 'border-t border-border' : ''
      }`}
    >
      <span
        className="absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full opacity-70 transition-opacity group-hover:opacity-100"
        style={{ background: color }}
      />
      <div className="flex w-14 shrink-0 flex-col items-center justify-center">
        <span className="font-mono text-sm font-bold text-foreground tabular-nums">{time}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <TargetIcon size={12} className="shrink-0 text-muted-foreground/70" />
          <p className="truncate text-sm font-semibold text-foreground">
            {activ.physName ?? activ.orgName ?? '—'}
          </p>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <User size={10} />
          {activ.usrLogin}
        </p>
        {activ.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/70">
            {activ.description}
          </p>
        )}
      </div>
      <StatusBadge name={activ.statusName} />
    </Link>
  );
}

function PanelHeader({ date, count, onClose }: { date: Date; count: number; onClose: () => void }) {
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long' });
  const label = `${date.getDate()} ${MONTHS_GEN[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <CalendarDays size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {weekday}
          </p>
          <h3 className="text-sm font-bold text-foreground">{label}</h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {count > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {count} визит(ов)
          </span>
        )}
        <Link
          href="/activs/create"
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-muted"
        >
          <Plus size={12} />
          Визит
        </Link>
        <button
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Закрыть"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function DayPanel({
  date,
  activs,
  onClose,
}: {
  date: Date;
  activs: ActivResponse[];
  onClose: () => void;
}) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <PanelHeader date={date} count={activs.length} onClose={onClose} />
      {activs.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">Нет визитов на этот день</p>
        </div>
      ) : (
        <div>
          {activs.map((a, i) => (
            <VisitRow key={a.activId} activ={a} withBorder={i > 0} />
          ))}
        </div>
      )}
    </div>
  );
}
