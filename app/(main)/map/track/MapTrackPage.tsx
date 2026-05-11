'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPinOff, Users } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { activsApi } from '@/lib/api/activs';
import { PageTransition } from '@/components/motion';
import { AlertBanner, Skeleton } from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { UserFilter } from '@/components/UserFilter';
import { Hero } from '@/components/Hero';
import type { ActivResponse } from '@/lib/api/types';

const MapTrackClient = dynamic(() => import('./MapTrackClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

const PAGE_SIZE = 5000;

export interface TrackedActiv {
  activId: number;
  usrLogin: string;
  orgName: string | null;
  physName: string | null;
  statusId: number;
  statusName: string;
  end: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function MapTrackPage() {
  const { user } = useAuth();
  const { canSeeAllActivs, isManager, isRepresentative } = useRoles();
  const canPickUser = canSeeAllActivs || isManager;

  const [usrId, setUsrId] = useState<string>(() =>
    isRepresentative && user ? String(user.usrId) : '',
  );
  const [dateFrom, setDateFrom] = useState<string>(() => defaultStart());
  const [dateTo, setDateTo] = useState<string>(() => defaultEnd());

  const [debounced, setDebounced] = useState({ usrId, dateFrom, dateTo });
  useEffect(() => {
    const t = setTimeout(() => setDebounced({ usrId, dateFrom, dateTo }), 300);
    return () => clearTimeout(t);
  }, [usrId, dateFrom, dateTo]);

  const effectiveUsrId =
    isRepresentative && user ? user.usrId : debounced.usrId ? Number(debounced.usrId) : undefined;
  const fromIso = debounced.dateFrom ? localToIso(debounced.dateFrom) : undefined;
  const toIso = debounced.dateTo ? localToIso(debounced.dateTo) : undefined;

  const { users } = usePickerUsers(canPickUser);

  const { data, loading } = useApi(['map-track', effectiveUsrId, fromIso, toIso], () =>
    activsApi
      .getAll({
        pageSize: PAGE_SIZE,
        sortBy: 'end',
        dateFrom: fromIso,
        dateTo: toIso,
        usrId: effectiveUsrId,
      })
      .then((r) => r.data),
  );

  const points = useMemo(() => extractTrackedActivs(data?.items ?? []), [data]);
  const overflow = (data?.items.length ?? 0) >= PAGE_SIZE;
  const hasFilters = !!(effectiveUsrId || fromIso || toIso);

  return (
    <PageTransition className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <Hero
        kicker="Маршрут"
        title="Трекинг визитов"
        tone="primary"
        subtitle={
          !loading && (
            <>
              {points.length} точек на маршруте
              {hasFilters && data && data.items.length !== points.length && (
                <>
                  {' '}
                  <span className="text-muted-foreground/50">·</span>{' '}
                  {data.items.length - points.length} без координат
                </>
              )}
            </>
          )
        }
      />

      <div className="flex flex-wrap items-stretch gap-3">
        {canPickUser ? (
          <UserFilter users={users} value={usrId} onChange={setUsrId} currentUsrId={user?.usrId} />
        ) : (
          <div className="border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-3">
            <div className="bg-muted ring-border flex h-8 w-8 items-center justify-center rounded-lg ring-1">
              <Users size={14} className="text-muted-foreground" />
            </div>
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Только мои визиты
            </span>
          </div>
        )}
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
        />
      </div>

      {overflow && (
        <AlertBanner>
          Период слишком широкий — показаны первые {PAGE_SIZE} визитов. Сузьте диапазон дат.
        </AlertBanner>
      )}

      <div className="border-border relative min-h-[400px] flex-1 overflow-hidden rounded-2xl border">
        {loading ? (
          <Skeleton className="h-full w-full rounded-2xl" />
        ) : points.length === 0 ? (
          <EmptyState />
        ) : (
          <MapTrackClient points={points} />
        )}
      </div>
    </PageTransition>
  );
}

function DateRangeFilter({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
}: {
  dateFrom: string;
  dateTo: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="border-border bg-card flex flex-1 flex-wrap items-center gap-3 rounded-2xl border px-4 py-3">
      <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
        Период
      </span>
      <div className="min-w-[200px] flex-1">
        <DateTimePicker value={dateFrom} onChange={onFromChange} placeholder="Начало" />
      </div>
      <div className="min-w-[200px] flex-1">
        <DateTimePicker value={dateTo} onChange={onToChange} placeholder="Конец" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="bg-muted ring-border flex h-12 w-12 items-center justify-center rounded-2xl ring-1">
        <MapPinOff size={20} className="text-muted-foreground" />
      </div>
      <p className="text-muted-foreground max-w-sm text-sm">
        За выбранный период нет завершённых визитов с координатами.
      </p>
    </div>
  );
}

function extractTrackedActivs(items: ActivResponse[]): TrackedActiv[] {
  return items
    .filter(
      (a): a is ActivResponse & { latitude: number; longitude: number; end: string } =>
        a.latitude != null && a.longitude != null && a.end != null,
    )
    .map((a) => ({
      activId: a.activId,
      usrLogin: a.usrLogin,
      orgName: a.orgName,
      physName: a.physName,
      statusId: a.statusId,
      statusName: a.statusName,
      end: a.end,
      description: a.description,
      latitude: a.latitude,
      longitude: a.longitude,
    }))
    .sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime());
}

function defaultStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toLocal(d);
}

function defaultEnd(): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return toLocal(d);
}

function toLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localToIso(local: string): string {
  return new Date(local).toISOString();
}
