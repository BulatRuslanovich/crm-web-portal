'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Phone, Plus, Stethoscope } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useRoles } from '@/lib/hooks/use-roles';
import { physesApi } from '@/lib/api/physes';
import type { PhysResponse } from '@/lib/api/types';
import { EmptyState, LinkButton, ListSkeleton, Pagination } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { PageHeader } from '@/components/PageHeader';
import { SearchBar } from '@/components/SearchBar';
import { RegistryToolbar } from '@/components/RegistryToolbar';
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
  const { isAdmin } = useRoles();
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
      <PageHeader
        title="Врачи"
        totalCount={data?.totalCount}
        action={
          isAdmin && (
            <LinkButton href="/physes/create">
              <Plus size={15} /> Добавить
            </LinkButton>
          )
        }
      />

      <RegistryToolbar>
        <SearchBar
          value={input}
          onChange={setInput}
          placeholder="Поиск по ФИО, специальности или контактам..."
        />
      </RegistryToolbar>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : physes.length === 0 ? (
        <EmptyPhyses hasFilter={hasFilter} canCreate={isAdmin} />
      ) : (
        <>
          <div className="border-border bg-card overflow-hidden rounded-xl border">
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
      className={`group hover:bg-muted/60 flex items-center gap-4 px-4 py-3 transition-colors duration-150 ${
        first ? '' : 'border-border border-t'
      }`}
    >
      <div className="border-border text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium tracking-tight">
        {initials || <Stethoscope size={15} strokeWidth={1.5} />}
      </div>
      <PhysMeta phys={phys} name={name} />
      {phys.orgs.length > 0 && (
        <div className="text-muted-foreground hidden shrink-0 items-center gap-1.5 text-xs tabular-nums sm:flex">
          <Building2 size={11} strokeWidth={1.5} />
          {phys.orgs.length}
        </div>
      )}
    </Link>
  );
}

function PhysMeta({ phys, name }: { phys: PhysResponse; name: string }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-foreground truncate text-sm font-medium tracking-tight">{name}</p>
      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {phys.specName && <span className="truncate">{phys.specName}</span>}
        {phys.specName && (phys.phone || phys.email) && (
          <span className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
        )}
        {phys.phone && (
          <span className="flex items-center gap-1 tabular-nums">
            <Phone size={11} strokeWidth={1.5} />
            {phys.phone}
          </span>
        )}
        {phys.email && (
          <span className="hidden items-center gap-1 sm:flex">
            <Mail size={11} strokeWidth={1.5} />
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
      icon={Stethoscope}
      message={hasFilter ? 'Ничего не найдено' : 'Врачей пока нет'}
      hint={hasFilter ? 'Попробуйте изменить поиск' : undefined}
      action={
        !hasFilter && canCreate ? (
          <Link
            href="/physes/create"
            className="text-foreground text-sm font-medium hover:underline"
          >
            Добавить первого врача
          </Link>
        ) : undefined
      }
    />
  );
}
