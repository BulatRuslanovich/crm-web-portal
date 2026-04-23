'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Hash, MapPin, Plus } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useIsAdmin } from '@/lib/hooks/use-is-admin';
import { orgsApi } from '@/lib/api/orgs';
import type { OrgResponse } from '@/lib/api/types';
import { EmptyState, LinkButton, ListSkeleton, Pagination } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { ListPageHeader } from '../_components/ListPageHeader';
import { SearchBar } from '../_components/SearchBar';
import { useDebouncedSearch } from '../_lib/use-debounced-search';
import { orgInitials } from '../_lib/initials';

const PAGE_SIZE = 20;

export default function OrgsPage() {
  const isAdmin = useIsAdmin();
  const [page, setPage] = useState(1);
  const { input, setInput, debounced: search } = useDebouncedSearch(() => setPage(1));

  const { data, loading } = useApi(
    ['orgs', page, search],
    () => orgsApi.getAll(page, PAGE_SIZE, search).then(({ data }) => data),
    { keepPreviousData: true },
  );

  const orgs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasFilter = !!search;

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      <ListPageHeader
        icon={Building2}
        title="Организации"
        totalCount={data?.totalCount}
        iconTone="success"
        action={
          isAdmin && (
            <LinkButton href="/orgs/create">
              <Plus size={15} /> Добавить
            </LinkButton>
          )
        }
      />

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <SearchBar
          value={input}
          onChange={setInput}
          placeholder="Поиск по названию, ИНН или адресу..."
        />
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : orgs.length === 0 ? (
        <EmptyOrgs hasFilter={hasFilter} canCreate={isAdmin} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {orgs.map((org, i) => (
              <OrgRow key={org.orgId} org={org} first={i === 0} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}

function OrgRow({ org, first }: { org: OrgResponse; first: boolean }) {
  return (
    <Link
      href={`/orgs/${org.orgId}`}
      className={`group relative flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 ${
        first ? '' : 'border-t border-border'
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-xs font-bold text-success ring-1 ring-success/20 transition-transform duration-200 group-hover:scale-105">
        {orgInitials(org.orgName)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{org.orgName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {org.orgTypeName && (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {org.orgTypeName}
            </span>
          )}
          {org.address && (
            <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{org.address}</span>
            </span>
          )}
        </div>
      </div>

      {org.inn && (
        <div className="hidden shrink-0 flex-col items-end sm:flex">
          <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            <Hash size={10} /> ИНН
          </span>
          <span className="font-mono text-xs text-foreground tabular-nums">{org.inn}</span>
        </div>
      )}
    </Link>
  );
}

function EmptyOrgs({ hasFilter, canCreate }: { hasFilter: boolean; canCreate: boolean }) {
  return (
    <EmptyState
      message={hasFilter ? 'Ничего не найдено' : 'Организаций пока нет'}
      action={
        !hasFilter && canCreate ? (
          <Link href="/orgs/create" className="text-sm font-medium text-foreground hover:underline">
            Добавить первую организацию
          </Link>
        ) : undefined
      }
    />
  );
}
