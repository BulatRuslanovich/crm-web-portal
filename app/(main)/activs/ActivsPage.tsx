'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Plus } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { useUserFilter } from '@/lib/hooks/use-user-filter';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { activsApi } from '@/lib/api/activs';
import type { ActivResponse } from '@/lib/api/types';
import { EmptyState, LinkButton, ListSkeleton, Pagination } from '@/components/ui';
import { UserFilter } from '@/components/UserFilter';
import { PageTransition } from '@/components/motion';
import { PageHeader } from '@/components/PageHeader';
import { SearchBar } from '@/components/SearchBar';
import { RegistryToolbar } from '@/components/RegistryToolbar';
import { useDebouncedSearch } from '@/lib/use-debounced-search';
import { ActivRow } from '@/components/ActivRow';
import { StatusFilter } from '@/components/StatusFilter';
import { groupActivsByDay } from '@/lib/activ-helper';
import { STATUS_OPEN, STATUS_PLANNED, STATUS_SAVED } from '@/lib/api/statuses';
import { startOfDay } from '@/lib/date';

const PAGE_SIZE = 25;
const SORT_FIELD = 'start';
type QuickFilter = 'all' | 'today' | 'open' | 'overdue';

export default function ActivsPage() {
  const { user } = useAuth();
  const { isAdmin, isDirector, isManager } = useRoles();
  const canFilterByUser = isAdmin || isDirector || isManager;

  const [page, setPage] = useState(1);
  const { input, setInput, debounced: search } = useDebouncedSearch(() => setPage(1));
  const [statusFilter, setStatusFilterRaw] = useState<number[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [filterUsrId, setFilterUsrIdRaw] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canFilterByUser);

  const setStatusFilter = (next: number[]) => {
    setStatusFilterRaw(next);
    setPage(1);
  };
  const setFilterUsrId = (next: string) => {
    setFilterUsrIdRaw(next);
    setPage(1);
  };
  const setQuick = (next: QuickFilter) => {
    setQuickFilter(next);
    setPage(1);
  };

  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;
  const quickQuery = buildQuickFilterQuery(quickFilter);
  const effectiveStatuses = statusFilter.length > 0 ? statusFilter : quickQuery.statuses;
  const { data, loading } = useApi(
    ['activs', page, search, statusFilter, quickFilter, usrIdParam],
    () =>
      activsApi
        .getAll({
          page,
          pageSize: PAGE_SIZE,
          search,
          sortBy: SORT_FIELD,
          sortDesc: true,
          statuses: effectiveStatuses,
          dateFrom: quickQuery.dateFrom,
          dateTo: quickQuery.dateTo,
          usrId: usrIdParam,
        })
        .then((res) => res.data),
    { keepPreviousData: true },
  );

  const activs = useMemo(() => (data?.items ?? []) as ActivResponse[], [data]);
  const totalPages = data?.totalPages ?? 0;
  const hasFilter = !!(search || statusFilter.length > 0 || quickFilter !== 'all' || filterUsrId);

  const grouped = useMemo(() => groupActivsByDay(activs), [activs]);

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      <PageHeader
        title="Визиты"
        totalCount={data?.totalCount}
        action={
          <LinkButton href="/activs/create">
            <Plus size={15} /> Новый визит
          </LinkButton>
        }
      />

      <RegistryToolbar>
        <QuickFilters value={quickFilter} onChange={setQuick} />
        <SearchBar
          value={input}
          onChange={setInput}
          placeholder="Поиск по организации или врачу..."
        />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </RegistryToolbar>

      {canFilterByUser && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      {loading ? (
        <ListSkeleton rows={5} />
      ) : activs.length === 0 ? (
        <EmptyActivs hasFilter={hasFilter} />
      ) : (
        <>
          <div className="space-y-5">
            {grouped.map(([label, items]) => (
              <ActivGroup key={label} label={label} items={items} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}

function buildQuickFilterQuery(filter: QuickFilter): {
  statuses?: number[];
  dateFrom?: string;
  dateTo?: string;
} {
  const today = startOfDay(new Date());
  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);

  if (filter === 'today') {
    return { dateFrom: today.toISOString(), dateTo: endToday.toISOString() };
  }
  if (filter === 'open') {
    return { statuses: [STATUS_OPEN] };
  }
  if (filter === 'overdue') {
    const yesterdayEnd = new Date(today);
    yesterdayEnd.setMilliseconds(-1);
    return {
      statuses: [STATUS_PLANNED, STATUS_OPEN, STATUS_SAVED],
      dateTo: yesterdayEnd.toISOString(),
    };
  }
  return {};
}

function QuickFilters({
  value,
  onChange,
}: {
  value: QuickFilter;
  onChange: (next: QuickFilter) => void;
}) {
  const items: Array<{ value: QuickFilter; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'today', label: 'Сегодня' },
    { value: 'open', label: 'Открытые' },
    { value: 'overdue', label: 'Просрочено' },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
            value === item.value
              ? 'border-foreground/25 bg-foreground text-background'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function ActivGroup({ label, items }: { label: string; items: ActivResponse[] }) {
  return (
    <section className="space-y-2">
      <div className="bg-background/90 sticky top-16 z-10 flex items-center gap-2 px-1 py-1 backdrop-blur md:top-6">
        <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {label}
        </h3>
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground/70 text-xs">{items.length}</span>
      </div>
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {items.map((activ, i) => (
          <ActivRow key={activ.activId} activ={activ} first={i === 0} />
        ))}
      </div>
    </section>
  );
}

function EmptyActivs({ hasFilter }: { hasFilter: boolean }) {
  return (
    <EmptyState
      icon={CalendarCheck}
      message={hasFilter ? 'Ничего не найдено' : 'Визитов пока нет'}
      hint={hasFilter ? 'Сбросьте фильтры или измените поиск' : undefined}
      action={
        hasFilter ? undefined : (
          <Link
            href="/activs/create"
            className="text-foreground text-sm font-medium hover:underline"
          >
            Создать первый визит
          </Link>
        )
      }
    />
  );
}
