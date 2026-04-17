'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useApi } from '@/lib/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { PageTransition } from '@/components/motion';
import { Skeleton } from '@/components/ui';
import { MapPin, SlidersHorizontal, Search, MapPinOff, List } from 'lucide-react';
import { colorForType } from './palette';
import type { OrgResponse } from '@/lib/api/types';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

export default function MapPage() {
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'located' | 'missing'>('located');
  const [flyToOrg, setFlyToOrg] = useState<OrgResponse | null>(null);

  const { data: orgsData, loading } = useApi(
    'map-orgs',
    () => orgsApi.getAll(1, 1000).then((r) => r.data),
  );

  const { data: orgTypes } = useApi('org-types', () =>
    orgsApi.getTypes().then((r) => r.data),
  );

  const filtered = useMemo(() => {
    const items = orgsData?.items ?? [];
    const q = search.toLowerCase().trim();
    return items.filter((o) => {
      if (typeFilter !== null && o.orgTypeId !== typeFilter) return false;
      if (q && !o.orgName.toLowerCase().includes(q) && !o.address?.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [orgsData, typeFilter, search]);

  const withCoords = useMemo(
    () => filtered.filter((o) => o.latitude !== 0 && o.longitude !== 0),
    [filtered],
  );
  const missingCoords = useMemo(
    () => filtered.filter((o) => o.latitude === 0 || o.longitude === 0),
    [filtered],
  );

  function handleFlyTo(org: OrgResponse) {
    setFlyToOrg({ ...org, _tick: Date.now() } as OrgResponse);
  }

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
              {missingCoords.length > 0 && ` · ${missingCoords.length} без координат`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--fg-subtle)"
          />
          <input
            type="text"
            placeholder="Поиск по имени или адресу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64 rounded-xl border border-(--border) bg-(--surface) pr-3.5 pl-9 text-sm text-(--fg) placeholder:text-(--fg-subtle) transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/40 focus:outline-none"
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

        {orgTypes?.map((t) => {
          const color = colorForType(t.orgTypeId);
          const active = typeFilter === t.orgTypeId;
          return (
            <button
              key={t.orgTypeId}
              onClick={() => setTypeFilter(active ? null : t.orgTypeId)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                active
                  ? 'text-white shadow-sm'
                  : 'border-(--border) bg-(--surface) text-(--fg-muted) hover:border-(--primary-border) hover:text-(--fg)'
              }`}
              style={active ? { background: color, borderColor: color } : undefined}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: active ? 'rgba(255,255,255,0.9)' : color }}
              />
              {t.orgTypeName}
            </button>
          );
        })}
      </div>

      {/* Map + sidebar */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div
          className="relative min-h-0 overflow-hidden rounded-2xl border border-(--border)"
          style={{ boxShadow: 'var(--shadow-sm)', minHeight: 400 }}
        >
          {loading ? (
            <Skeleton className="h-full w-full rounded-2xl" />
          ) : (
            <MapClient orgs={withCoords} flyToOrg={flyToOrg} />
          )}
        </div>

        {/* Sidebar */}
        <aside
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex border-b border-(--border)">
            <button
              onClick={() => setTab('located')}
              className={`flex-1 cursor-pointer px-3 py-2.5 text-xs font-semibold transition-colors ${
                tab === 'located'
                  ? 'border-b-2 border-(--primary) text-(--primary-text)'
                  : 'text-(--fg-muted) hover:text-(--fg)'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <List size={13} />
                На карте ({withCoords.length})
              </span>
            </button>
            <button
              onClick={() => setTab('missing')}
              className={`flex-1 cursor-pointer px-3 py-2.5 text-xs font-semibold transition-colors ${
                tab === 'missing'
                  ? 'border-b-2 border-(--primary) text-(--primary-text)'
                  : 'text-(--fg-muted) hover:text-(--fg)'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPinOff size={13} />
                Без коорд. ({missingCoords.length})
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : tab === 'located' ? (
              withCoords.length === 0 ? (
                <div className="p-6 text-center text-xs text-(--fg-muted)">
                  Ничего не найдено
                </div>
              ) : (
                <ul className="divide-y divide-(--border)">
                  {withCoords.map((o) => {
                    const color = colorForType(o.orgTypeId);
                    return (
                      <li key={o.orgId}>
                        <button
                          onClick={() => handleFlyTo(o)}
                          className="flex w-full cursor-pointer items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-(--surface-raised)"
                        >
                          <span
                            className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ background: color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold text-(--fg)">
                              {o.orgName}
                            </div>
                            <div
                              className="truncate text-[10px] font-medium"
                              style={{ color }}
                            >
                              {o.orgTypeName}
                            </div>
                            {o.address && (
                              <div className="truncate text-[10px] text-(--fg-muted)">
                                {o.address}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : missingCoords.length === 0 ? (
              <div className="p-6 text-center text-xs text-(--fg-muted)">
                Все организации с координатами
              </div>
            ) : (
              <ul className="divide-y divide-(--border)">
                {missingCoords.map((o) => (
                  <li key={o.orgId}>
                    <Link
                      href={`/orgs/${o.orgId}`}
                      className="flex w-full items-start gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-(--surface-raised)"
                    >
                      <MapPinOff
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-(--fg-subtle)"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-(--fg)">
                          {o.orgName}
                        </div>
                        <div className="truncate text-[10px] text-(--fg-muted)">
                          {o.orgTypeName}
                          {o.address && ` · ${o.address}`}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}
