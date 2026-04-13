'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { STATUSES } from '@/lib/api/statuses';
import { StatusBadge, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion';
import { Search, SlidersHorizontal, CalendarCheck, Plus } from 'lucide-react';

const PAGE_SIZE = 10;

export default function ActivsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number[]>([]);

  const { data, loading } = useApi(
    ['activs', page, search, statusFilter],
    () =>
      activsApi
        .getAll(page, PAGE_SIZE, search, 'start', true, statusFilter)
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

  const activs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasFilter = search || statusFilter.length > 0;

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-subtle)">
            <CalendarCheck size={18} className="text-(--primary-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Визиты</h2>
            {data && <p className="text-xs text-(--fg-muted)">Всего: {data.totalCount}</p>}
          </div>
        </div>
        <LinkButton href="/activs/create">
          <Plus size={15} /> Новый визит
        </LinkButton>
      </div>

      <div className="space-y-2.5">
        <div className="relative">
          <Search
            size={15}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-(--fg-subtle)"
          />
          <input
            type="text"
            placeholder="Поиск по организации..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-10 w-full rounded-xl border border-(--border) bg-(--surface) pr-3.5 pl-10 text-sm text-(--fg) transition-all duration-200 placeholder:text-(--fg-subtle) focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={13} className="text-(--fg-subtle)" />
          {STATUSES.map((s) => {
            const active = statusFilter.includes(s.statusId);
            return (
              <button
                key={s.statusId}
                onClick={() => toggleStatus(s.statusId)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'border-(--primary) bg-(--primary) text-(--primary-fg) shadow-sm'
                    : 'border-(--border) bg-(--surface) text-(--fg-muted) hover:border-(--primary-border) hover:text-(--fg)'
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
              className="ml-1 cursor-pointer text-xs text-(--fg-muted) transition-colors hover:text-(--danger-text)"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : activs.length === 0 ? (
        <EmptyState
          message={hasFilter ? 'Ничего не найдено' : 'Визитов пока нет'}
          action={
            !hasFilter ? (
              <Link
                href="/activs/create"
                className="text-sm font-medium text-(--primary-text) hover:underline"
              >
                Создать первый визит
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
            style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
          >
            <StaggerList>
              {activs.map((a, i) => (
                <StaggerItem key={a.activId}>
                  <Link
                    href={`/activs/${a.activId}`}
                    className={`flex items-center justify-between gap-4 px-5 py-4 transition-all duration-150 hover:bg-(--surface-raised) ${
                      i > 0 ? 'border-t border-(--border)' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-(--fg)">{a.orgName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-(--fg-muted)">
                          {a.start
                            ? new Date(a.start).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Без даты'}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-(--fg-subtle)" />
                        <span className="text-xs text-(--fg-muted)">{a.usrLogin}</span>
                        {a.drugs.length > 0 && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-(--fg-subtle)" />
                            <span className="text-xs text-(--fg-muted)">
                              {a.drugs.length} препар.
                            </span>
                          </>
                        )}
                      </div>
                      {a.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-(--fg-subtle)">
                          {a.description}
                        </p>
                      )}
                    </div>
                    <StatusBadge name={a.statusName} />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}
