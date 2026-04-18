'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { useAuth } from '@/lib/auth-context';
import { EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Building2, Plus, MapPin, Search, X, Hash } from 'lucide-react';

function orgInitials(name: string): string {
  const words = name
    .replace(/["«»]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^(ООО|ЗАО|ОАО|ПАО|ИП|АО|МУП|ГБУЗ|ФГУП)$/i.test(w));
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function OrgsPage() {
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, loading } = useApi(
    ['orgs', page, search],
    () => orgsApi.getAll(page, 20, search).then(({ data }) => data),
    { keepPreviousData: true },
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const orgs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasFilter = !!search;

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 ring-1 ring-success/20">
            <Building2 size={20} className="text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Организации</h2>
            {data && (
              <p className="text-xs text-muted-foreground">
                Всего: <span className="font-semibold text-foreground">{data.totalCount}</span>
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <LinkButton href="/orgs/create">
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
            placeholder="Поиск по названию, ИНН или адресу..."
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
      ) : orgs.length === 0 ? (
        <EmptyState
          message={hasFilter ? 'Ничего не найдено' : 'Организаций пока нет'}
          action={
            !hasFilter && isAdmin ? (
              <Link
                href="/orgs/create"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Добавить первую организацию
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {orgs.map((o, i) => (
              <Link
                key={o.orgId}
                href={`/orgs/${o.orgId}`}
                className={`group relative flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 ${
                  i > 0 ? 'border-t border-border' : ''
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-xs font-bold text-success ring-1 ring-success/20 transition-transform duration-200 group-hover:scale-105">
                  {orgInitials(o.orgName)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{o.orgName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {o.orgTypeName && (
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {o.orgTypeName}
                      </span>
                    )}
                    {o.address && (
                      <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{o.address}</span>
                      </span>
                    )}
                  </div>
                </div>

                {o.inn && (
                  <div className="hidden shrink-0 flex-col items-end sm:flex">
                    <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                      <Hash size={10} /> ИНН
                    </span>
                    <span className="font-mono text-xs text-foreground tabular-nums">{o.inn}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}
