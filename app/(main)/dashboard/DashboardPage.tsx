'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  CalendarCheck,
  Clock3,
  Plus,
  Route,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { useUserFilter } from '@/lib/hooks/use-user-filter';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { PageTransition } from '@/components/motion';
import { UserFilter } from '@/components/UserFilter';
import { useDashboardActivs, useDashboardWorkQueue } from '@/lib/use-dashboard-data';
import { HeatmapSection } from '@/components/HeatmapSection';
import { StatusBadge, Skeleton } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { FINAL_STATUSES, STATUS_OPEN, STATUS_PLANNED } from '@/lib/api/statuses';
import { fmtTimeIso, isSameDay, startOfDay } from '@/lib/date';
import type { ActivResponse } from '@/lib/api/types';

const MS_PER_DAY = 86_400_000;

export default function DashboardPage() {
  const { user } = useAuth();
  const { isManager, isDirector, isAdmin } = useRoles();
  const canFilterByUser = isManager || isDirector || isAdmin;

  const [filterUsrId, setFilterUsrId] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canFilterByUser);
  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;

  const { data: myActivs, loading: activsLoading, meta } = useDashboardActivs(usrIdParam);
  const { data: workQueue, loading: queueLoading } = useDashboardWorkQueue(usrIdParam);
  const filteredActivs = myActivs ?? [];
  const queueActivs = workQueue?.items ?? [];
  const overview = buildOverview(queueActivs);
  const name = user?.firstName ?? user?.login ?? '';

  return (
    <PageTransition className="space-y-6">
      <DashboardHero name={name} overview={overview} loading={queueLoading} />

      {canFilterByUser && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorkQueue
          title="Сегодня и ближайшие"
          hint="План на день и следующие визиты"
          activs={overview.upcoming}
          loading={queueLoading}
          empty="Нет запланированных визитов на ближайшие дни"
        />
        <WorkQueue
          title="Требуют внимания"
          hint="Просроченные и открытые визиты"
          activs={overview.attention}
          loading={queueLoading}
          empty="Критичных визитов нет"
          compact
        />
      </section>

      {!activsLoading && meta && meta.totalCount > 0 && (
        <p className="text-muted-foreground px-1 text-xs">
          Тепловая карта рассчитана по {filteredActivs.length} из {meta.totalCount} загруженных
          визитов.
        </p>
      )}

      <HeatmapSection activs={filteredActivs} loading={activsLoading} />
    </PageTransition>
  );
}

interface DashboardOverview {
  today: ActivResponse[];
  attention: ActivResponse[];
  upcoming: ActivResponse[];
  openCount: number;
  plannedCount: number;
}

function buildOverview(activs: ActivResponse[]): DashboardOverview {
  const now = new Date();
  const todayStart = startOfDay(now);

  const active = activs.filter((a) => !FINAL_STATUSES.has(a.statusId));
  const today = active.filter((a) => a.start && isSameDay(new Date(a.start), now));
  const attention = active
    .filter((a) => a.statusId === STATUS_OPEN || isOverdue(a, todayStart))
    .sort(sortByStart)
    .slice(0, 6);
  const upcoming = active
    .filter((a) => a.start && new Date(a.start).getTime() >= todayStart.getTime())
    .sort(sortByStart)
    .slice(0, 8);

  return {
    today,
    attention,
    upcoming,
    openCount: active.filter((a) => a.statusId === STATUS_OPEN).length,
    plannedCount: active.filter((a) => a.statusId === STATUS_PLANNED).length,
  };
}

function isOverdue(activ: ActivResponse, todayStart: Date): boolean {
  if (!activ.start || FINAL_STATUSES.has(activ.statusId)) return false;
  return new Date(activ.start).getTime() < todayStart.getTime();
}

function sortByStart(a: ActivResponse, b: ActivResponse): number {
  return startMs(a) - startMs(b);
}

function startMs(activ: ActivResponse): number {
  return activ.start ? new Date(activ.start).getTime() : Number.MAX_SAFE_INTEGER;
}

function getGreeting(hour: number): string {
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function DashboardHero({
  name,
  overview,
  loading,
}: {
  name: string;
  overview: DashboardOverview;
  loading?: boolean;
}) {
  const greeting = getGreeting(new Date().getHours());
  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <section className="border-border bg-card rounded-xl border p-4 sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs first-letter:uppercase">{today}</p>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight">
            {greeting}
            {name ? `, ${name}` : ''}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Рабочая сводка по визитам, маршрутам и задачам, которые требуют реакции.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-9">
            <Link href="/activs/create">
              <Plus size={15} />
              Новый визит
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9">
            <Link href="/calendar">
              <CalendarCheck size={15} />
              Календарь
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9">
            <Link href="/map/track">
              <Route size={15} />
              Трекинг
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Сегодня" value={overview.today.length} loading={loading} />
        <MetricCard label="Открыто" value={overview.openCount} loading={loading} tone="warning" />
        <MetricCard label="Запланировано" value={overview.plannedCount} loading={loading} />
        <MetricCard
          label="Внимание"
          value={overview.attention.length}
          loading={loading}
          tone={overview.attention.length > 0 ? 'danger' : 'neutral'}
        />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  loading,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  loading?: boolean;
  tone?: 'neutral' | 'warning' | 'danger';
}) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${metricToneClass(tone)}`}>
      <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-14" />
      ) : (
        <p className="text-foreground mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      )}
    </div>
  );
}

function metricToneClass(tone: 'neutral' | 'warning' | 'danger'): string {
  if (tone === 'warning') return 'border-warning/30 bg-warning/10';
  if (tone === 'danger') return 'border-destructive/30 bg-destructive/10';
  return 'border-border bg-background/60';
}

function WorkQueue({
  title,
  hint,
  activs,
  loading,
  empty,
  compact,
}: {
  title: string;
  hint: string;
  activs: ActivResponse[];
  loading?: boolean;
  empty: string;
  compact?: boolean;
}) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{title}</h2>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </div>
        <Link
          href="/activs"
          className="text-muted-foreground hover:text-foreground text-xs font-medium"
        >
          Все визиты
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : activs.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">{empty}</p>
        </div>
      ) : (
        <div className="divide-border divide-y">
          {activs.map((activ) => (
            <DashboardActivItem key={activ.activId} activ={activ} compact={compact} />
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardActivItem({ activ, compact }: { activ: ActivResponse; compact?: boolean }) {
  const target = activ.physName ?? activ.orgName ?? 'Без контакта';
  const Icon = activ.physName ? Stethoscope : Building2;
  const dayLabel = formatRelativeDay(activ.start);

  return (
    <Link
      href={`/activs/${activ.activId}`}
      className="hover:bg-muted/60 flex items-center gap-3 px-4 py-3 transition-colors"
    >
      <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-foreground truncate text-sm font-medium">{target}</p>
          {!compact && <StatusBadge name={activ.statusName} statusId={activ.statusId} />}
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} />
            {dayLabel}, {fmtTimeIso(activ.start)}
          </span>
          {compact && <StatusBadge name={activ.statusName} statusId={activ.statusId} />}
        </div>
      </div>
      {isOverdue(activ, startOfDay(new Date())) && (
        <AlertTriangle size={15} className="text-destructive shrink-0" />
      )}
    </Link>
  );
}

function formatRelativeDay(iso: string | null): string {
  if (!iso) return 'Без даты';

  const target = startOfDay(new Date(iso)).getTime();
  const today = startOfDay(new Date()).getTime();
  const diff = Math.round((target - today) / MS_PER_DAY);

  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Завтра';
  if (diff === -1) return 'Вчера';
  if (diff < 0) return `${Math.abs(diff)} дн. назад`;

  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}
