'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/use-roles';
import { useUserFilter } from '@/lib/use-user-filter';
import { usePickerUsers } from '@/lib/use-picker-users';
import { activsApi } from '@/lib/api/activs';
import { STATUSES } from '@/lib/api/statuses';
import { StatusBadge, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { UserFilter } from '@/components/UserFilter';
import { PageTransition } from '@/components/motion';
import {
  Search,
  SlidersHorizontal,
  CalendarCheck,
  Plus,
  Building2,
  Stethoscope,
  Pill,
  User,
  X,
} from 'lucide-react';

const PAGE_SIZE = 25;

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

type ActivItem = {
  activId: number;
  physId: number | null;
  physName: string | null;
  orgName: string | null;
  start: string | null;
  usrLogin: string;
  statusName: string;
  description: string | null;
  drugs: { drugId: number; drugName: string }[];
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupLabel(iso: string | null): string {
  if (!iso) return 'Без даты';
  const d = new Date(iso);
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Завтра';
  if (diffDays === -1) return 'Вчера';
  if (diffDays > 1 && diffDays <= 7) return 'На этой неделе';
  if (diffDays < -1 && diffDays >= -7) return 'На прошлой неделе';
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function groupOrder(label: string): number {
  const order: Record<string, number> = {
    'Сегодня': 0,
    'Завтра': 1,
    'На этой неделе': 2,
    'Вчера': 3,
    'На прошлой неделе': 4,
    'Без даты': 99,
  };
  return order[label] ?? 50;
}

export default function ActivsPage() {
  const { user } = useAuth();
  const { isAdmin, isDirector, isManager } = useRoles();
  const canFilterByUser = isAdmin || isDirector || isManager;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [filterUsrId, setFilterUsrId] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canFilterByUser);

  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;
  const { data, loading } = useApi(
    ['activs', page, search, statusFilter, usrIdParam],
    () =>
      activsApi
        .getAll(page, PAGE_SIZE, search, 'start', true, statusFilter, undefined, undefined, usrIdParam)
        .then((res) => res.data),
    { keepPreviousData: true },
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  function toggleStatus(id: number) {
    setPage(1);
    setStatusFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const activs = (data?.items ?? []) as ActivItem[];
  const totalPages = data?.totalPages ?? 0;
  const hasFilter = search || statusFilter.length > 0 || filterUsrId;

  const grouped = useMemo(() => {
    const map = new Map<string, ActivItem[]>();
    for (const a of activs) {
      const key = groupLabel(a.start);
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return [...map.entries()].sort((a, b) => groupOrder(a[0]) - groupOrder(b[0]));
  }, [activs]);

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <CalendarCheck size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Визиты</h2>
            {data && (
              <p className="text-xs text-muted-foreground">
                Всего: <span className="font-semibold text-foreground">{data.totalCount}</span>
              </p>
            )}
          </div>
        </div>
        <LinkButton href="/activs/create">
          <Plus size={15} /> Новый визит
        </LinkButton>
      </div>

      {/* Filter bar */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            type="text"
            placeholder="Поиск по организации или врачу..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background pr-10 pl-10 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/40 focus:outline-none"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Очистить"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal size={13} />
            <span>Статус:</span>
          </div>
          {STATUSES.map((s) => {
            const active = statusFilter.includes(s.statusId);
            return (
              <button
                key={s.statusId}
                onClick={() => toggleStatus(s.statusId)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {s.statusName}
              </button>
            );
          })}
          {statusFilter.length > 0 && (
            <button
              onClick={() => {
                setStatusFilter([]);
                setPage(1);
              }}
              className="ml-auto flex cursor-pointer items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs text-muted-foreground transition-all hover:border-destructive/30 hover:text-destructive"
            >
              <X size={12} /> Сбросить
            </button>
          )}
        </div>
      </div>

      {canFilterByUser && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      {/* List */}
      {loading ? (
        <ListSkeleton rows={5} />
      ) : activs.length === 0 ? (
        <EmptyState
          message={hasFilter ? 'Ничего не найдено' : 'Визитов пока нет'}
          action={
            !hasFilter ? (
              <Link
                href="/activs/create"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Создать первый визит
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-5">
            {grouped.map(([label, items]) => (
              <section key={label} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {label}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground/70">{items.length}</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  {items.map((a, i) => (
                    <ActivRow key={a.activId} activ={a} first={i === 0} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}

function ActivRow({ activ, first }: { activ: ActivItem; first: boolean }) {
  const isPhys = activ.physId != null;
  const targetName = isPhys ? activ.physName : activ.orgName;
  const TargetIcon = isPhys ? Stethoscope : Building2;

  const date = activ.start ? new Date(activ.start) : null;
  const day = date ? date.getDate().toString().padStart(2, '0') : '—';
  const month = date ? MONTHS_SHORT[date.getMonth()] : '';
  const weekday = date ? WEEKDAYS_SHORT[date.getDay()] : '';
  const time = date
    ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    : '';

  const statusKey = activ.statusName.toLowerCase();
  const stripe =
    statusKey === 'запланирован'
      ? 'bg-primary'
      : statusKey === 'открыт'
        ? 'bg-warning'
        : statusKey === 'сохранен'
          ? 'bg-muted-foreground'
          : statusKey === 'закрыт'
            ? 'bg-success'
            : 'bg-border';

  return (
    <Link
      href={`/activs/${activ.activId}`}
      className={`group relative flex items-stretch gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 ${
        first ? '' : 'border-t border-border'
      }`}
    >
      {/* Status stripe */}
      <span
        className={`absolute top-2 bottom-2 left-0 w-0.5 rounded-r-full ${stripe} opacity-70 transition-opacity group-hover:opacity-100`}
      />

      {/* Date block */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/60 py-1.5">
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/80 uppercase">
          {weekday}
        </span>
        <span className="text-lg leading-none font-bold text-foreground">{day}</span>
        <span className="text-[10px] text-muted-foreground/80">{month}</span>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <TargetIcon size={13} className="shrink-0 text-muted-foreground/70" />
          <p className="truncate text-sm font-semibold text-foreground">{targetName ?? '—'}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {time && <span className="font-medium tabular-nums text-foreground/80">{time}</span>}
          {time && <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />}
          <span className="flex items-center gap-1">
            <User size={11} />
            {activ.usrLogin}
          </span>
          {activ.drugs.length > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1">
                <Pill size={11} />
                {activ.drugs.length}
              </span>
            </>
          )}
        </div>
        {activ.description && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">{activ.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center">
        <StatusBadge name={activ.statusName} />
      </div>
    </Link>
  );
}
