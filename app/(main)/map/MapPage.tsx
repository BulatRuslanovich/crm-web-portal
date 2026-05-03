'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useApi } from '@/lib/hooks/use-api';
import { orgsApi } from '@/lib/api/orgs';
import { PageTransition } from '@/components/motion';
import { Skeleton } from '@/components/ui';
import {
  MapPin,
  SlidersHorizontal,
  Search,
  MapPinOff,
  List,
  Building2,
  Crosshair,
  X,
} from 'lucide-react';
import { colorForType } from './palette';
import type { OrgResponse } from '@/lib/api/types';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />,
});

export interface FlyToOrgTarget {
  org: OrgResponse;
  nonce: number;
}

export default function MapPage() {
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'located' | 'missing'>('located');
  const [flyToOrg, setFlyToOrg] = useState<FlyToOrgTarget | null>(null);

  const { data: orgsData, loading } = useApi('map-orgs', () =>
    orgsApi.getAll(1, 1000).then((r) => r.data),
  );

  const { data: orgTypes } = useApi('org-types', () => orgsApi.getTypes().then((r) => r.data));

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

  const totalAll = orgsData?.items.length ?? 0;
  const hasFilter = search !== '' || typeFilter !== null;

  function handleFlyTo(org: OrgResponse) {
    setFlyToOrg((prev) => ({ org, nonce: (prev?.nonce ?? 0) + 1 }));
  }

  return (
    <PageTransition className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      {/* Hero */}
      <div className="border-border from-success/5 via-muted to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm">
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-foreground text-xl font-bold">Карта организаций</h2>
              {!loading && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {withCoords.length} на карте
                  {missingCoords.length > 0 && (
                    <>
                      <span className="text-muted-foreground/50 mx-1.5">·</span>
                      <span className="text-warning">{missingCoords.length} без координат</span>
                    </>
                  )}
                  {hasFilter && totalAll > 0 && (
                    <>
                      <span className="text-muted-foreground/50 mx-1.5">·</span>
                      из {totalAll}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="text-muted-foreground/70 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Поиск по имени или адресу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:ring-ring/40 h-9 w-64 rounded-xl border pr-8 pl-9 text-sm transition-all focus:ring-2 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
                  aria-label="Очистить"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {hasFilter && (
              <button
                onClick={() => {
                  setSearch('');
                  setTypeFilter(null);
                }}
                className="text-muted-foreground hover:text-destructive inline-flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors"
              >
                <X size={12} />
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Type filter chips */}
      {orgTypes && orgTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="text-muted-foreground flex items-center gap-1.5 pr-2 text-xs">
            <SlidersHorizontal size={12} />
            <span className="font-semibold tracking-wider uppercase">Тип</span>
          </div>
          <button
            onClick={() => setTypeFilter(null)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              typeFilter === null
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            Все
          </button>
          {orgTypes.map((t) => {
            const color = colorForType(t.orgTypeId);
            const active = typeFilter === t.orgTypeId;
            return (
              <button
                key={t.orgTypeId}
                onClick={() => setTypeFilter(active ? null : t.orgTypeId)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
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
      )}

      {/* Map + sidebar */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Map */}
        <div className="border-border relative min-h-[400px] overflow-hidden rounded-2xl border shadow-sm">
          {loading ? (
            <Skeleton className="h-full w-full rounded-2xl" />
          ) : (
            <MapClient orgs={withCoords} flyToOrg={flyToOrg} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="border-border bg-card flex min-h-0 flex-col overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-border flex shrink-0 border-b">
            <button
              onClick={() => setTab('located')}
              className={`group relative flex-1 cursor-pointer px-3 py-3 text-xs font-semibold transition-colors ${
                tab === 'located'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <List size={13} />
                На карте
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    tab === 'located'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {withCoords.length}
                </span>
              </span>
              {tab === 'located' && (
                <span className="bg-primary absolute inset-x-3 bottom-0 h-0.5 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setTab('missing')}
              className={`group relative flex-1 cursor-pointer px-3 py-3 text-xs font-semibold transition-colors ${
                tab === 'missing'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPinOff size={13} />
                Без коорд.
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    tab === 'missing'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {missingCoords.length}
                </span>
              </span>
              {tab === 'missing' && (
                <span className="bg-warning absolute inset-x-3 bottom-0 h-0.5 rounded-t-full" />
              )}
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
                <EmptyState
                  icon={MapPin}
                  text={hasFilter ? 'Ничего не найдено' : 'Нет организаций на карте'}
                />
              ) : (
                <ul className="divide-border divide-y">
                  {withCoords.map((o) => {
                    const color = colorForType(o.orgTypeId);
                    return (
                      <li key={o.orgId}>
                        <button
                          onClick={() => handleFlyTo(o)}
                          className="group hover:bg-muted/60 flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors"
                        >
                          <span
                            className="ring-border mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 transition-transform group-hover:scale-110"
                            style={{ background: color }}
                          >
                            <Building2 size={11} className="text-white" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-foreground truncate text-xs font-semibold">
                              {o.orgName}
                            </div>
                            <div
                              className="mt-0.5 truncate text-[10px] font-semibold tracking-wider uppercase"
                              style={{ color }}
                            >
                              {o.orgTypeName}
                            </div>
                            {o.address && (
                              <div className="text-muted-foreground mt-0.5 flex items-start gap-1 text-[10px]">
                                <MapPin
                                  size={9}
                                  className="text-muted-foreground/60 mt-0.5 shrink-0"
                                />
                                <span className="truncate">{o.address}</span>
                              </div>
                            )}
                          </div>
                          <Crosshair
                            size={14}
                            className="text-muted-foreground/40 mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : missingCoords.length === 0 ? (
              <EmptyState icon={MapPin} text="Все организации с координатами" tone="success" />
            ) : (
              <ul className="divide-border divide-y">
                {missingCoords.map((o) => (
                  <li key={o.orgId}>
                    <Link
                      href={`/orgs/${o.orgId}`}
                      className="group hover:bg-muted/60 flex items-start gap-3 px-4 py-3 transition-colors"
                    >
                      <span className="bg-warning/20 ring-warning/30 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2">
                        <MapPinOff size={11} className="text-warning" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground truncate text-xs font-semibold">
                          {o.orgName}
                        </div>
                        <div className="text-muted-foreground mt-0.5 truncate text-[10px]">
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

function EmptyState({
  icon: Icon,
  text,
  tone = 'default',
}: {
  icon: React.ElementType;
  text: string;
  tone?: 'default' | 'success';
}) {
  const toneCls =
    tone === 'success'
      ? 'bg-success/10 text-success ring-success/20'
      : 'bg-muted text-muted-foreground ring-border';
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${toneCls}`}>
        <Icon size={16} />
      </div>
      <p className="text-muted-foreground text-xs">{text}</p>
    </div>
  );
}
