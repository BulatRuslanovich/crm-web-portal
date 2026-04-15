'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApi } from '@/lib/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { PageTransition } from '@/components/motion';
import { Skeleton } from '@/components/ui';
import { MapPin, SlidersHorizontal } from 'lucide-react';


const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

export default function MapPage() {
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: orgsData, loading } = useApi(
    'map-orgs',
    () => orgsApi.getAll(1, 1000).then((r) => r.data),
  );

  const { data: orgTypes } = useApi('org-types', () =>
    orgsApi.getTypes().then((r) => r.data),
  );

  const filtered = useMemo(() => {
    const items = orgsData?.items ?? [];
    return items.filter((o) => {
      if (typeFilter !== null && o.orgTypeId !== typeFilter) return false;
      if (search && !o.orgName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [orgsData, typeFilter, search]);

  const withCoords = filtered.filter((o) => o.latitude !== 0 && o.longitude !== 0);
  const noCoords = filtered.length - withCoords.length;

  return (
    <PageTransition className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-subtle)">
            <MapPin size={18} className="text-(--primary-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Карта организаций</h2>
            <p className="text-xs text-(--fg-muted)">
              {withCoords.length} на карте
              {noCoords > 0 && ` · ${noCoords} без координат`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск организации..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm text-(--fg) placeholder:text-(--fg-subtle) transition-all focus:border-(--ring) focus:outline-none focus:ring-2 focus:ring-(--ring)/40"
          />
        </div>

        <SlidersHorizontal size={13} className="text-(--fg-subtle)" />

        <button
          onClick={() => setTypeFilter(null)}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            typeFilter === null
              ? 'border-(--primary) bg-(--primary) text-(--primary-fg) shadow-sm'
              : 'border-(--border) bg-(--surface) text-(--fg-muted) hover:border-(--primary-border) hover:text-(--fg)'
          }`}
        >
          Все
        </button>

        {orgTypes?.map((t) => (
          <button
            key={t.orgTypeId}
            onClick={() => setTypeFilter(typeFilter === t.orgTypeId ? null : t.orgTypeId)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              typeFilter === t.orgTypeId
                ? 'border-(--primary) bg-(--primary) text-(--primary-fg) shadow-sm'
                : 'border-(--border) bg-(--surface) text-(--fg-muted) hover:border-(--primary-border) hover:text-(--fg)'
            }`}
          >
            {t.orgTypeName}
          </button>
        ))}
      </div>

      {/* Map */}
      <div
        className="relative flex-1 overflow-hidden rounded-2xl border border-(--border)"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {loading ? (
          <Skeleton className="h-full w-full rounded-2xl" />
        ) : (
          <MapClient orgs={withCoords} />
        )}
      </div>
    </PageTransition>
  );
}
