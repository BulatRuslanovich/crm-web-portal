'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { useAuth } from '@/lib/auth-context';
import { PageHeader, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion';

export default function OrgsPage() {
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const [page, setPage] = useState(1);

  const { data, loading } = useApi(
    () => orgsApi.getAll(page, 20).then(({ data }) => data),
    [page],
  );
  const orgs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <PageTransition className="max-w-4xl mx-auto">
      <PageHeader
        title="Организации"
        action={isAdmin ? <LinkButton href="/orgs/create">Добавить</LinkButton> : undefined}
      />

      {loading ? (
        <ListSkeleton rows={4} />
      ) : orgs.length === 0 ? (
        <EmptyState message="Организаций пока нет" />
      ) : (
        <>
          <div
            className="bg-(--surface) border border-(--border) rounded-xl divide-y divide-(--border) overflow-hidden"
            style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
          >
            <StaggerList>
              {orgs.map((o) => (
                <StaggerItem key={o.orgId}>
                  <Link
                    href={`/orgs/${o.orgId}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 hover:bg-(--surface-raised) transition-colors gap-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-(--fg)">{o.orgName}</p>
                      <p className="text-xs text-(--fg-muted) mt-0.5">
                        {o.orgTypeName}{o.address ? ` · ${o.address}` : ''}
                      </p>
                    </div>
                    {o.inn && (
                      <span className="text-xs text-(--fg-muted)">ИНН: {o.inn}</span>
                    )}
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
