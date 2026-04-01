'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { physesApi } from '@/lib/api/physes';
import type { PhysResponse } from '@/lib/api/types';
import { PageHeader, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';

export default function PhysesPage() {
  const [physes, setPhyses] = useState<PhysResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(p: number) {
    setLoading(true);
    try {
      const { data } = await physesApi.getAll(p, 20);
      setPhyses(data.items);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  return (
    <div className="max-w-4xl mx-auto">
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
          <div className="bg-(--surface) border border-(--border) rounded-xl divide-y divide-(--border)" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {physes.map((p) => {
              const name = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
              return (
                <Link
                  key={p.physId}
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
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
