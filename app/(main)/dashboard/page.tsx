'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import type { ActivResponse } from '@/lib/api/types';
import { StatusBadge, Skeleton } from '@/components/ui';
import { CalendarCheck, Building2, Stethoscope, ArrowRight } from 'lucide-react';

/* ── helpers ──────────────────────────────────────────────────────────────── */

function statusColor(name: string): string {
  const n = name.toLowerCase();
  if (n === 'запланирован') return 'var(--primary)';
  if (n === 'открыт')      return 'var(--warn)';
  if (n === 'сохранен')    return 'var(--violet-text)';
  if (n === 'закрыт')      return 'var(--success)';
  return 'var(--fg-muted)';
}

/* ── StatCard ─────────────────────────────────────────────────────────────── */

function StatCard({
  label, value, href, icon: Icon, color, loading,
}: {
  label: string; value: number; href: string;
  icon: React.ElementType; color: string; loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group bg-(--surface) border border-(--border) rounded-xl p-5 hover:border-(--primary) transition-all block"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <ArrowRight size={14} className="text-(--fg-subtle) group-hover:text-(--primary) transition-colors" />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16 mt-4 mb-1" />
      ) : (
        <p className="text-3xl font-bold text-(--fg) mt-4">{value}</p>
      )}
      <p className="text-sm text-(--fg-muted) mt-0.5">{label}</p>
    </Link>
  );
}

/* ── DonutChart ───────────────────────────────────────────────────────────── */

function DonutChart({ slices, total }: {
  slices: { name: string; count: number; color: string }[];
  total: number;
}) {
  const r = 30;
  const cx = 50, cy = 50;
  const sw = 13;
  const circ = 2 * Math.PI * r;

  let acc = 0;
  const segments = slices.map(sl => {
    const len = total > 0 ? (sl.count / total) * circ : 0;
    const seg = { ...sl, len, offset: acc };
    acc += len;
    return seg;
  });

  return (
    <svg viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-raised)" strokeWidth={sw} />
      {segments.map(({ name, color, len, offset }) => (
        <circle
          key={name}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={`${Math.max(len - 2, 0)} ${circ}`}
          strokeDashoffset={-offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: '15px', fontWeight: 700, fill: 'var(--fg)' }}
      >
        {total}
      </text>
      <text
        x={cx} y={cy + 13}
        textAnchor="middle"
        style={{ fontSize: '7px', fill: 'var(--fg-muted)' }}
      >
        визитов
      </text>
    </svg>
  );
}

/* ── StatusBreakdown ──────────────────────────────────────────────────────── */

function StatusBreakdown({ activs, totalCount, loading }: { activs: ActivResponse[]; totalCount: number; loading: boolean }) {
  const statuses = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activs) {
      map.set(a.statusName, (map.get(a.statusName) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count, color: statusColor(name) }))
      .sort((a, b) => b.count - a.count);
  }, [activs]);

  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <h3 className="text-base font-semibold text-(--fg) mb-4">По статусам</h3>
      {loading ? (
        <div className="flex gap-6 items-center">
          <Skeleton className="w-28 h-28 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      ) : statuses.length === 0 ? (
        <p className="text-sm text-(--fg-muted)">Нет данных</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="w-28 shrink-0">
            <DonutChart slices={statuses} total={totalCount} />
          </div>
          <div className="flex-1 space-y-2.5">
            {statuses.map(({ name, count, color }) => {
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-sm text-(--fg) truncate">{name}</span>
                  </div>
                  <span className="text-xs text-(--fg-muted) tabular-nums shrink-0">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DashboardPage ────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();
  const [allActivs, setAllActivs] = useState<ActivResponse[]>([]);
  const [recentActivs, setRecentActivs] = useState<ActivResponse[]>([]);
  const [stats, setStats] = useState({ activs: 0, orgs: 0, physes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      activsApi.getAll(1, 200),
      orgsApi.getAll(1, 1),
      physesApi.getAll(1, 1),
    ]).then(([activsRes, orgsRes, physesRes]) => {
      const items = activsRes.data.items;
      setAllActivs(items);
      setRecentActivs(
        [...items]
          .sort((a, b) => {
            if (!a.start && !b.start) return 0;
            if (!a.start) return 1;
            if (!b.start) return -1;
            return new Date(b.start).getTime() - new Date(a.start).getTime();
          })
          .slice(0, 5),
      );
      setStats({
        activs: activsRes.data.totalCount,
        orgs: orgsRes.data.totalCount,
        physes: physesRes.data.totalCount,
      });
    }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const name = user?.firstName ?? user?.login ?? '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-(--fg)">
          {greeting}{name ? `, ${name}` : ''}
        </h2>
        <p className="text-sm text-(--fg-muted) mt-1">Добро пожаловать в Pharmo CRM</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard loading={loading} label="Визитов всего" value={stats.activs} href="/activs" icon={CalendarCheck} color="bg-(--primary-subtle) text-(--primary-text)" />
        <StatCard loading={loading} label="Организаций"   value={stats.orgs}   href="/orgs"   icon={Building2}    color="bg-(--success-subtle) text-(--success-text)" />
        <StatCard loading={loading} label="Врачей"        value={stats.physes} href="/physes" icon={Stethoscope}   color="bg-(--warn-subtle) text-(--warn-text)" />
      </div>

      <StatusBreakdown activs={allActivs} totalCount={stats.activs} loading={loading} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-(--fg)">Последние визиты</h3>
          <Link href="/activs" className="text-sm text-(--primary-text) hover:underline flex items-center gap-1">
            Все <ArrowRight size={13} />
          </Link>
        </div>

        <div className="bg-(--surface) border border-(--border) rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          {loading ? (
            <div className="divide-y divide-(--border)">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentActivs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-(--fg-muted)">Визитов пока нет</div>
          ) : (
            <div className="divide-y divide-(--border)">
              {recentActivs.map(a => (
                <Link
                  key={a.activId}
                  href={`/activs/${a.activId}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-(--surface-raised) transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-(--fg)">{a.orgName}</p>
                    <p className="text-xs text-(--fg-muted) mt-0.5">
                      {a.start ? new Date(a.start).toLocaleDateString('ru-RU') : '—'}
                      {' · '}{a.usrLogin}
                    </p>
                  </div>
                  <StatusBadge name={a.statusName} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
