'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { orgsApi } from '@/lib/api/orgs';
import { useAuth } from '@/lib/auth-context';
import type { OrgResponse } from '@/lib/api/types';
import { PageHeader, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';

export default function OrgsPage() {
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const [orgs, setOrgs] = useState<OrgResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(p: number) {
    setLoading(true);
    try {
      const { data } = await orgsApi.getAll(p, 20);
      setOrgs(data.items);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  return (
    <div className="max-w-4xl mx-auto">
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
          <div className="bg-(--surface) border border-(--border) rounded-xl divide-y divide-(--border)" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {orgs.map((o) => (
              <Link
                key={o.orgId}
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
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
