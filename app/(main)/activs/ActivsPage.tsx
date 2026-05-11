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
import { useDebouncedSearch } from '@/lib/use-debounced-search';
import { ActivRow } from '@/components/ActivRow';
import { StatusFilter } from '@/components/StatusFilter';
import { groupActivsByDay } from '@/lib/activ-helper';

const PAGE_SIZE = 25;
const SORT_FIELD = 'start';

export default function ActivsPage() {
  const { user } = useAuth();
  const { isAdmin, isDirector, isManager } = useRoles();
  const canFilterByUser = isAdmin || isDirector || isManager;

  const [page, setPage] = useState(1);
  const { input, setInput, debounced: search } = useDebouncedSearch(() => setPage(1));
  const [statusFilter, setStatusFilterRaw] = useState<number[]>([]);
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

  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;
  const { data, loading } = useApi(
    ['activs', page, search, statusFilter, usrIdParam],
    () =>
      activsApi
        .getAll({
          page,
          pageSize: PAGE_SIZE,
          search,
          sortBy: SORT_FIELD,
          sortDesc: true,
          statuses: statusFilter,
          usrId: usrIdParam,
        })
        .then((res) => res.data),
    { keepPreviousData: true },
  );

  const activs = useMemo(() => (data?.items ?? []) as ActivResponse[], [data]);
  const totalPages = data?.totalPages ?? 0;
  const hasFilter = !!(search || statusFilter.length > 0 || filterUsrId);

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

      <div className="border-border bg-card space-y-3 rounded-2xl border p-3">
        <SearchBar
          value={input}
          onChange={setInput}
          placeholder="Поиск по организации или врачу..."
        />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

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

function ActivGroup({ label, items }: { label: string; items: ActivResponse[] }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {label}
        </h3>
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground/70 text-xs">{items.length}</span>
      </div>
      <div className="border-border bg-card overflow-hidden rounded-2xl border">
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
