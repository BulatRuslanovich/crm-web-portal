'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { physesApi } from '@/lib/api/physes';
import { PageHeader, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion';

export default function PhysesPage() {
  const [page, setPage] = useState(1);

  const { data, loading } = useApi(
    () => physesApi.getAll(page, 20).then(({ data }) => data),
    [page],
  );
  const physes = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <PageTransition className="max-w-4xl mx-auto">
      <PageHeader
        title="Врачи"
        action={<LinkButton href="/physes/create">Добавить</LinkButton>}
      />

      {loading ? (
        <ListSkeleton rows={4} />
      ) : physes.length === 0 ? (
        <EmptyState message="Врачей пока нет" />
      ) : (
        <>
          <div
            className="bg-(--surface) border border-(--border) rounded-xl divide-y divide-(--border) overflow-hidden"
            style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
          >
            <StaggerList>
              {physes.map((p) => {
                const name = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
                return (
                  <StaggerItem key={p.physId}>
                    <Link
                      href={`/physes/${p.physId}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 hover:bg-(--surface-raised) transition-colors gap-1"
                    >
                      <div>
                        <p className="text-sm font-medium text-(--fg)">{name}</p>
                        <p className="text-xs text-(--fg-muted) mt-0.5">
                          {p.specName ?? '—'}{p.position ? ` · ${p.position}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-(--fg-muted)">
                        {p.phone && <span>{p.phone}</span>}
                        {p.orgs.length > 0 && <span>{p.orgs.length} орг.</span>}
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerList>
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </PageTransition>
  );
}
