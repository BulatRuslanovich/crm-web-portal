'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { useAuth } from '@/lib/auth-context';
import { EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Building2, Plus, MapPin } from 'lucide-react';

export default function OrgsPage() {
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const [page, setPage] = useState(1);

  const { data, loading } = useApi(
    ['orgs', page],
    () => orgsApi.getAll(page, 20).then(({ data }) => data),
    { keepPreviousData: true },
  );
  const orgs = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <PageTransition className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--success-subtle)">
            <Building2 size={18} className="text-(--success-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Организации</h2>
            {data && <p className="text-xs text-(--fg-muted)">Всего: {data.totalCount}</p>}
          </div>
        </div>
        {isAdmin && (
          <LinkButton href="/orgs/create">
            <Plus size={15} /> Добавить
          </LinkButton>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : orgs.length === 0 ? (
        <EmptyState message="Организаций пока нет" />
      ) : (
        <>
          <div
            className="divide-y divide-(--border) overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
            style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
          >
            {orgs.map((o) => (
              <Link
                key={o.orgId}
                href={`/orgs/${o.orgId}`}
                className="flex flex-col gap-1.5 px-5 py-4 transition-all duration-150 hover:bg-(--surface-raised) sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-(--fg)">{o.orgName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md bg-(--surface-raised) px-2 py-0.5 text-xs font-medium text-(--fg-muted)">
                      {o.orgTypeName}
                    </span>
                    {o.address && (
                      <span className="flex items-center gap-1 text-xs text-(--fg-muted)">
                        <MapPin size={10} /> {o.address}
                      </span>
                    )}
                  </div>
                </div>
                {o.inn && (
                  <span className="font-mono text-xs text-(--fg-muted) tabular-nums">
                    ИНН: {o.inn}
                  </span>
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
