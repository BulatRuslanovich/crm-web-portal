'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion';
import { CardSkeleton } from '@/components/ui';
import { STATUS_HEX } from '@/lib/api/statuses';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { ActivResponse } from '@/lib/api/types';
import { format, subDays, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

function buildDailyData(activs: ActivResponse[], periodDays: number) {
  const today = startOfDay(new Date());
  const days: { date: string; count: number }[] = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, 'dd.MM', { locale: ru });
    days.push({ date: key, count: 0 });
  }

  for (const a of activs) {
    const d = startOfDay(new Date(a.start));
    const key = format(d, 'dd.MM', { locale: ru });
    const idx = days.findIndex((x) => x.date === key);
    if (idx !== -1) days[idx].count++;
  }
  return days;
}

function buildTopOrgs(activs: ActivResponse[], top = 10) {
  const map = new Map<string, number>();
  for (const a of activs) {
    map.set(a.orgName, (map.get(a.orgName) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([name, count]) => ({ name, count }));
}

function buildTopDrugs(activs: ActivResponse[], top = 10) {
  const map = new Map<string, number>();
  for (const a of activs) {
    for (const d of a.drugs) {
      map.set(d.drugName, (map.get(d.drugName) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([name, count]) => ({ name, count }));
}

function buildByUsr(activs: ActivResponse[]) {
  const map = new Map<string, number>();
  for (const a of activs) {
    map.set(a.usrLogin, (map.get(a.usrLogin) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

function buildByStatus(activs: ActivResponse[]) {
  const map = new Map<string, number>();
  for (const a of activs) {
    map.set(a.statusName, (map.get(a.statusName) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

const tooltipStyle = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    fontSize: '12px',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--fg)',
  },
  cursor: { fill: 'var(--surface-raised)' },
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="hover-glow rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all duration-200"
      style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
    >
      <h3 className="mb-4 text-sm font-bold text-(--fg)">{title}</h3>
      {children}
    </div>
  );
}


const PERIODS = [
  { value: 7, label: '7 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
  { value: 365, label: 'Год' },
];

export default function AnalyticsPage() {
  const [periodDays, setPeriodDays] = useState(30);

  const { data: activs, loading } = useApi(
    ['analytics-activs', periodDays],
    () => {
      const to = new Date().toISOString();
      const from = subDays(startOfDay(new Date()), periodDays - 1).toISOString();
      return activsApi
        .getAll(1, undefined, undefined, 'start', true, undefined, from, to)
        .then((r) => r.data.items);
    },
    { keepPreviousData: true },
  );

  const daily = useMemo(
    () => (activs ? buildDailyData(activs, periodDays) : []),
    [activs, periodDays],
  );
  const topOrgs = useMemo(() => (activs ? buildTopOrgs(activs) : []), [activs]);
  const topDrugs = useMemo(() => (activs ? buildTopDrugs(activs) : []), [activs]);
  const byUsr = useMemo(() => (activs ? buildByUsr(activs) : []), [activs]);
  const byStatus = useMemo(() => (activs ? buildByStatus(activs) : []), [activs]);

  const statusColors: string[] = byStatus.map(
    (d) => STATUS_HEX[d.name.toLowerCase()] ?? '#94a3b8',
  );

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-subtle)">
            <TrendingUp size={18} className="text-(--primary-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Аналитика</h2>
            {activs && (
              <p className="text-xs text-(--fg-muted)">По данным {activs.length} визитов</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodDays(p.value)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                periodDays === p.value
                  ? 'border-(--primary) bg-(--primary) text-(--primary-fg) shadow-sm'
                  : 'border-(--border) bg-(--surface) text-(--fg-muted) hover:border-(--primary-border) hover:text-(--fg)'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <StaggerItem key={i}>
              <CardSkeleton />
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <>
          <ChartCard title={`Визиты за последние ${periodDays} дн.`}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--fg-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={periodDays >= 365 ? 30 : 4}
                  angle={-45}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--fg-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip {...tooltipStyle} />
                <Bar
                  dataKey="count"
                  name="Визиты"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {byStatus.length > 0 && (
              <ChartCard title="По статусам">
                <div className="flex items-center gap-6">
                  <div className="h-52 w-52 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {byStatus.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={statusColors[i]}
                            />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {byStatus.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: statusColors[i] }}
                          />
                          <span className="text-(--fg-muted)">{d.name}</span>
                        </div>
                        <span className="font-bold tabular-nums text-(--fg)">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            )}

            {byUsr.length > 0 && (
              <ChartCard title="Активность сотрудников">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={byUsr}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: 'var(--fg-muted)' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 11, fill: 'var(--fg-muted)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar
                      dataKey="count"
                      name="Визиты"
                      fill="var(--violet-text)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {topOrgs.length > 0 && (
              <ChartCard title={`Топ организаций по визитам`}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topOrgs}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: 'var(--fg-muted)' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 10, fill: 'var(--fg-muted)' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: string) => (v.length > 16 ? v.slice(0, 14) + '…' : v)}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar
                      dataKey="count"
                      name="Визиты"
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {topDrugs.length > 0 && (
              <ChartCard title="Топ препаратов">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topDrugs}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: 'var(--fg-muted)' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 10, fill: 'var(--fg-muted)' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: string) => (v.length > 16 ? v.slice(0, 14) + '…' : v)}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar
                      dataKey="count"
                      name="Визиты"
                      fill="#059669"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {activs?.length === 0 && (
            <div className="rounded-2xl border border-(--border) bg-(--surface) py-20 text-center">
              <p className="text-sm text-(--fg-muted)">Нет данных для анализа</p>
              <Link
                href="/activs/create"
                className="mt-3 inline-block text-sm font-medium text-(--primary-text) hover:underline"
              >
                Создать первый визит
              </Link>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
