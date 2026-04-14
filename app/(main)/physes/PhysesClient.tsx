'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { physesApi } from '@/lib/api/physes';
import { EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { Stethoscope, Plus, Phone, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PhysesPage() {
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const [page, setPage] = useState(1);

  const { data, loading } = useApi(
    ['physes', page],
    () => physesApi.getAll(page, 20).then(({ data }) => data),
    { keepPreviousData: true },
  );
  const physes = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <PageTransition className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--warn-subtle)">
            <Stethoscope size={18} className="text-(--warn-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Врачи</h2>
            {data && <p className="text-xs text-(--fg-muted)">Всего: {data.totalCount}</p>}
          </div>
        </div>
        {isAdmin && (
          <LinkButton href="/physes/create">
            <Plus size={15} /> Добавить
          </LinkButton>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : physes.length === 0 ? (
        <EmptyState message="Врачей пока нет" />
      ) : (
        <>
          <div
            className="divide-y divide-(--border) overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
            style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
          >
            {physes.map((p) => {
              const name = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
              const initials = ((p.lastName?.[0] ?? '') + (p.firstName?.[0] ?? '')).toUpperCase();
              return (
                <Link
                  key={p.physId}
                  href={`/physes/${p.physId}`}
                  className="flex items-center gap-4 px-5 py-4 transition-all duration-150 hover:bg-(--surface-raised)"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary-subtle) text-xs font-bold text-(--primary-text)">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-(--fg)">{name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      {p.specName && (
                        <span className="rounded-md bg-(--surface-raised) px-2 py-0.5 text-xs font-medium text-(--fg-muted)">
                          {p.specName}
                        </span>
                      )}
                      {p.position && (
                        <span className="text-xs text-(--fg-muted)">{p.position}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-(--fg-muted)">
                    {p.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {p.phone}
                      </span>
                    )}
                    {p.orgs.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Building2 size={10} /> {p.orgs.length}
                      </span>
                    )}
                  </div>
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
