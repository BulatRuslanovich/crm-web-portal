import { useMemo } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, Play, User } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import {
  STATUS_CLOSED, STATUS_HEX, STATUS_OPEN, STATUS_PLANNED,
} from '@/lib/api/statuses';
import { Skeleton, StatusBadge } from '@/components/ui';
import { isSameDay, fmtTimeIso } from '@/lib/date';
import { MONTHS_GEN } from '@/lib/ru-dates';
import { ToneIcon } from '@/components/ToneIcon';

const DEFAULT_COLOR = '#94a3b8';

interface DayStats {
  total: number;
  planned: number;
  open: number;
  closed: number;
}

function computeStats(visits: ActivResponse[]): DayStats {
  const s: DayStats = { total: visits.length, planned: 0, open: 0, closed: 0 };
  for (const a of visits) {
    if (a.statusId === STATUS_PLANNED) s.planned++;
    else if (a.statusId === STATUS_OPEN) s.open++;
    else if (a.statusId === STATUS_CLOSED) s.closed++;
  }
  return s;
}

function StatBadges({ stats }: { stats: DayStats }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {stats.closed > 0 && (
        <span className="rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">
          {stats.closed} закрыт{stats.closed === 1 ? '' : 'о'}
        </span>
      )}
      {stats.open > 0 && (
        <span className="rounded-full bg-warning/20 px-2 py-0.5 font-semibold text-warning">
          {stats.open} в работе
        </span>
      )}
      {stats.planned > 0 && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
          {stats.planned} план
        </span>
      )}
    </div>
  );
}

function NextUpBanner({ visit }: { visit: ActivResponse }) {
  return (
    <div className="border-b border-border bg-primary/5 px-5 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-primary uppercase">
          <Clock size={11} /> Следующий
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {visit.physName ?? visit.orgName ?? '—'}
          </p>
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            в {fmtTimeIso(visit.start)}
          </p>
        </div>
        <Link
          href={`/activs/${visit.activId}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
        >
          <Play size={12} /> Открыть
        </Link>
      </div>
    </div>
  );
}

function VisitRow({ activ }: { activ: ActivResponse }) {
  const color = STATUS_HEX[activ.statusName.toLowerCase()] ?? DEFAULT_COLOR;
  const target = activ.physName ?? activ.orgName ?? '—';
  const isNow = activ.statusId === STATUS_OPEN;

  return (
    <Link
      href={`/activs/${activ.activId}`}
      className={`relative flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/60 ${
        isNow ? 'bg-warning/5' : ''
      }`}
    >
      <span
        className="absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full"
        style={{ background: color }}
      />
      <div className="flex w-14 shrink-0 flex-col items-center">
        <span className="font-mono text-sm font-bold text-foreground tabular-nums">
          {fmtTimeIso(activ.start)}
        </span>
        {isNow && (
          <span className="mt-0.5 flex items-center gap-1 text-[9px] font-bold tracking-wider text-warning uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
            идёт
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{target}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <User size={10} />
          {activ.usrLogin}
        </p>
      </div>
      <StatusBadge name={activ.statusName} />
    </Link>
  );
}

function MyDayHeader({ stats }: { stats: DayStats }) {
  const today = new Date();
  const weekday = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  const dateLabel = `${today.getDate()} ${MONTHS_GEN[today.getMonth()]}`;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <ToneIcon icon={CalendarDays} tone="primary" />
        <div>
          <h3 className="text-sm font-bold text-foreground">Мой день</h3>
          <p className="text-xs text-muted-foreground capitalize">
            {weekday}, {dateLabel}
          </p>
        </div>
      </div>
      {stats.total > 0 && <StatBadges stats={stats} />}
    </div>
  );
}

export function MyDay({
  activs,
  loading,
}: {
  activs: ActivResponse[];
  loading?: boolean;
}) {
  const today = useMemo(() => new Date(), []);

  const todaysVisits = useMemo(
    () =>
      activs
        .filter((a) => a.start && isSameDay(new Date(a.start), today))
        .sort((a, b) => {
          const at = a.start ? new Date(a.start).getTime() : 0;
          const bt = b.start ? new Date(b.start).getTime() : 0;
          return at - bt;
        }),
    [activs, today],
  );

  const stats = useMemo(() => computeStats(todaysVisits), [todaysVisits]);

  const nowMs = useMemo(() => today.getTime(), [today]);
  const nextVisit = useMemo(
    () =>
      todaysVisits.find(
        (a) =>
          a.statusId === STATUS_PLANNED &&
          a.start &&
          new Date(a.start).getTime() >= nowMs,
      ),
    [todaysVisits, nowMs],
  );

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <MyDayHeader stats={stats} />
      {nextVisit && <NextUpBanner visit={nextVisit} />}

      {loading ? (
        <div className="space-y-2 p-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : todaysVisits.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">На сегодня визитов нет</p>
          <Link
            href="/activs/create"
            className="mt-2 inline-block text-sm font-medium text-foreground hover:underline"
          >
            Запланировать визит
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {todaysVisits.map((a) => (
            <VisitRow key={a.activId} activ={a} />
          ))}
        </div>
      )}
    </section>
  );
}
