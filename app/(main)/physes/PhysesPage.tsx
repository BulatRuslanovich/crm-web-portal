'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { physesApi } from '@/lib/api/physes';
import { EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Stethoscope, Plus, Phone, Building2, Search, X, Mail } from 'lucide-react';
import { useIsAdmin } from '@/lib/use-is-admin';

export default function PhysesPage() {
  const isAdmin = useIsAdmin();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, loading } = useApi(
    ['physes', page, search],
    () => physesApi.getAll(page, 20, search).then(({ data }) => data),
    { keepPreviousData: true },
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const physes = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasFilter = !!search;

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/15 ring-1 ring-warning/25">
            <Stethoscope size={20} className="text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Врачи</h2>
            {data && (
              <p className="text-xs text-muted-foreground">
                Всего: <span className="font-semibold text-foreground">{data.totalCount}</span>
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <LinkButton href="/physes/create">
            <Plus size={15} /> Добавить
          </LinkButton>
        )}
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            type="text"
            placeholder="Поиск по ФИО, специальности или контактам..."
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
      </div>

      {/* List */}
      {loading ? (
        <ListSkeleton rows={5} />
      ) : physes.length === 0 ? (
        <EmptyState
          message={hasFilter ? 'Ничего не найдено' : 'Врачей пока нет'}
          action={
            !hasFilter && isAdmin ? (
              <Link
                href="/physes/create"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Добавить первого врача
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {physes.map((p, i) => {
              const name = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
              const initials = ((p.lastName?.[0] ?? '') + (p.firstName?.[0] ?? '')).toUpperCase();
              return (
                <Link
                  key={p.physId}
                  href={`/physes/${p.physId}`}
                  className={`group flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 ${
                    i > 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning/15 text-xs font-bold text-warning ring-1 ring-warning/25 transition-transform duration-200 group-hover:scale-105">
                    {initials || <Stethoscope size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {p.specName && (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {p.specName}
                        </span>
                      )}
                      {p.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={11} />
                          {p.phone}
                        </span>
                      )}
                      {p.email && (
                        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                          <Mail size={11} />
                          <span className="max-w-[160px] truncate">{p.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {p.orgs.length > 0 && (
                    <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex">
                      <Building2 size={11} />
                      {p.orgs.length}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}
