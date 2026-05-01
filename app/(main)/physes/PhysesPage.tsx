'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Phone, Plus, Stethoscope } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useIsAdmin } from '@/lib/hooks/use-is-admin';
import { physesApi } from '@/lib/api/physes';
import type { PhysResponse } from '@/lib/api/types';
import { EmptyState, LinkButton, ListSkeleton, Pagination } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { ListPageHeader } from '@/components/ListPageHeader';
import { SearchBar } from '@/components/SearchBar';
import { useDebouncedSearch } from '@/lib/use-debounced-search';
import { physFullName, physInitials } from '@/lib/initials';

const PAGE_SIZE = 20;

const DEV_TRIGGER = /^(getname|гетнейм)$/i;

const DEV_CARD: PhysResponse = {
  physId: -1,
  lastName: 'getname',
  firstName: '',
  middleName: null,
  specId: 0,
  specName: 'Разработка ПО',
  phone: '',
  email: 'getname04@gmail.com',
  orgs: [],
};

export default function PhysesPage() {
  const isAdmin = useIsAdmin();
  const [page, setPage] = useState(1);
  const { input, setInput, debounced: search } = useDebouncedSearch(() => setPage(1));

  const { data, loading } = useApi(
    ['physes', page, search],
    () => physesApi.getAll(page, PAGE_SIZE, search).then(({ data }) => data),
    { keepPreviousData: true },
  );

  const physes = DEV_TRIGGER.test(search) ? [DEV_CARD] : (data?.items ?? []);
  const totalPages = data?.totalPages ?? 1;
  const hasFilter = !!search;

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      <ListPageHeader
        icon={Stethoscope}
        title="Врачи"
        totalCount={data?.totalCount}
        iconTone="warning"
        action={
          isAdmin && (
            <LinkButton href="/physes/create">
              <Plus size={15} /> Добавить
            </LinkButton>
          )
        }
      />

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <SearchBar
          value={input}
          onChange={setInput}
          placeholder="Поиск по ФИО, специальности или контактам..."
        />
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : physes.length === 0 ? (
        <EmptyPhyses hasFilter={hasFilter} canCreate={isAdmin} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {physes.map((phys, i) => (
              <PhysRow key={phys.physId} phys={phys} first={i === 0} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}

function PhysRow({ phys, first }: { phys: PhysResponse; first: boolean }) {
  const name = physFullName(phys.lastName, phys.firstName, phys.middleName);
  const initials = physInitials(phys.lastName, phys.firstName);

  return (
    <Link
      href={`/physes/${phys.physId}`}
      className={`group flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 ${
        first ? '' : 'border-t border-border'
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning/15 text-xs font-bold text-warning ring-1 ring-warning/25 transition-transform duration-200 group-hover:scale-105">
        {initials || <Stethoscope size={16} />}
      </div>
      <PhysMeta phys={phys} name={name} />
      {phys.orgs.length > 0 && (
        <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:flex">
          <Building2 size={11} />
          {phys.orgs.length}
        </div>
      )}
    </Link>
  );
}

function PhysMeta({ phys, name }: { phys: PhysResponse; name: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {phys.specName && (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {phys.specName}
          </span>
        )}
        {phys.phone && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone size={11} />
            {phys.phone}
          </span>
        )}
        {phys.email && (
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Mail size={11} />
            <span className="max-w-[160px] truncate">{phys.email}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyPhyses({ hasFilter, canCreate }: { hasFilter: boolean; canCreate: boolean }) {
  return (
    <EmptyState
      message={hasFilter ? 'Ничего не найдено' : 'Врачей пока нет'}
      action={
        !hasFilter && canCreate ? (
          <Link href="/physes/create" className="text-sm font-medium text-foreground hover:underline">
            Добавить первого врача
          </Link>
        ) : undefined
      }
    />
  );
}
