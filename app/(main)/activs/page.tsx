'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { activsApi } from '@/lib/api/activs';
import { STATUSES } from '@/lib/api/statuses';
import type { ActivResponse } from '@/lib/api/types';
import { StatusBadge, EmptyState, Pagination, LinkButton, ListSkeleton } from '@/components/ui';
import { Search, SlidersHorizontal } from 'lucide-react';

const PAGE_SIZE = 20;

export default function ActivsPage() {
  const [allActivs, setAllActivs] = useState<ActivResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    activsApi.getAll(1, 500)
      .then(({ data }) => setAllActivs(data.items))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  function toggleStatus(id: number) {
    setPage(1);
    setStatusFilter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const filtered = useMemo(() => {
    return allActivs.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.orgName.toLowerCase().includes(q) ||
        a.statusName.toLowerCase().includes(q) ||
        a.usrLogin.toLowerCase().includes(q);
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(a.statusId);
      return matchSearch && matchStatus;
    });
  }, [allActivs, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageActivs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilter = search || statusFilter.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-(--fg)">Визиты</h2>
        <LinkButton href="/activs/create">+ Новый визит</LinkButton>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-subtle)" />
          <input
            type="text"
            placeholder="Поиск по организации, статусу, сотруднику..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-(--surface) border border-(--border) rounded-xl text-sm text-(--fg) placeholder:text-(--fg-subtle) focus:outline-none focus:ring-2 focus:ring-(--ring) transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={13} className="text-(--fg-subtle)" />
          {STATUSES.map((s) => {
            const active = statusFilter.includes(s.statusId);
            return (
              <button
                key={s.statusId}
                onClick={() => toggleStatus(s.statusId)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                  active
                    ? 'bg-(--primary) text-(--primary-fg) border-(--primary)'
                    : 'bg-(--surface) text-(--fg-muted) border-(--border) hover:border-(--primary) hover:text-(--fg)'
                }`}
              >
                {s.statusName}
              </button>
            );
          })}
          {statusFilter.length > 0 && (
            <button
              onClick={() => { setStatusFilter([]); setPage(1); }}
              className="text-xs text-(--fg-muted) hover:text-(--danger-text) transition-colors cursor-pointer"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          message={hasFilter ? 'Ничего не найдено' : 'Визитов пока нет'}
          action={
            !hasFilter ? (
              <Link href="/activs/create" className="text-sm text-(--primary-text) hover:underline">
                Создать первый визит
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="bg-(--surface) border border-(--border) rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {pageActivs.map((a, i) => (
              <Link
                key={a.activId}
                href={`/activs/${a.activId}`}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-(--surface-raised) transition-colors gap-4 ${
                  i > 0 ? 'border-t border-(--border)' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-(--fg) truncate">{a.orgName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-(--fg-muted)">
                      {a.start ? new Date(a.start).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Без даты'}
                    </span>
                    <span className="text-xs text-(--fg-subtle)">&middot;</span>
                    <span className="text-xs text-(--fg-muted)">{a.usrLogin}</span>
                    {a.drugs.length > 0 && (
                      <>
                        <span className="text-xs text-(--fg-subtle)">&middot;</span>
                        <span className="text-xs text-(--fg-muted)">{a.drugs.length} препар.</span>
                      </>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-xs text-(--fg-muted) mt-0.5 line-clamp-1">{a.description}</p>
                  )}
                </div>
                <StatusBadge name={a.statusName} />
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-(--fg-muted) px-1">
            <span>{filtered.length} визит(ов)</span>
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
