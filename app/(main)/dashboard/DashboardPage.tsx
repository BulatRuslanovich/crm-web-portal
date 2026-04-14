'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import { StatusBadge, Skeleton } from '@/components/ui';
import { PageTransition, StaggerList, StaggerItem, HoverCard } from '@/components/motion';
import { formatShort } from '@/lib/format';
import type { ActivResponse } from '@/lib/api/types';
import { STATUS_HEX } from '@/lib/api/statuses';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

function StatCard({
  label,
  value,
  href,
  loading,
}: {
  label: string;
  value: number;
  href: string;
  loading?: boolean;
}) {
  return (
    <HoverCard>
      <Link
        href={href}
        className="group hover-glow block rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all duration-200 hover:border-(--primary-border)"
        style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
      >
        {loading ? (
          <Skeleton className="mt-4 mb-1 h-9 w-20" />
        ) : (
          <p className="text-3xl font-bold tracking-tight text-(--fg) tabular-nums">
            {value}
          </p>
        )}
        <p className="text-sm text-(--fg-muted)">{label}</p>
      </Link>
    </HoverCard>
  );
}

const renderCustomShape = (props: PieSectorDataItem) => {
  const { name } = props.payload as { name: string };

  const fill =
    STATUS_HEX[name.toLowerCase()] ?? '#94a3b8';

  return <Sector {...props} fill={fill} />;
};

function StatusChart({ activs }: { activs: ActivResponse[] }) {
  const counts = new Map<string, number>();
  for (const a of activs) {
    counts.set(a.statusName, (counts.get(a.statusName) ?? 0) + 1);
  }
  const data = [...counts.entries()].map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div
      className="hover-glow rounded-2xl border border-(--border) bg-(--surface) p-5 transition-all duration-200"
      style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <h3 className="text-sm font-bold text-(--fg)">По статусам</h3>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-78 w-78 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={132}
                outerRadius={155}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                shape={renderCustomShape}
                />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((d) => (
            <div key={d.name} className="flex justify-between text-xl">
              <div className="flex items-center gap-3.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                  style={{ background: STATUS_HEX[d.name.toLowerCase()] ?? '#94a3b8' }}
                />
                <span className="text-(--fg-muted)">{d.name}</span>
              </div>
              <span className="font-bold text-(--fg) tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivs({ activs }: { activs: ActivResponse[] }) {
  const recent = activs.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <div
      className="hover-glow overflow-hidden rounded-2xl border border-(--border) bg-(--surface) transition-all duration-200"
      style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
    >
      <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-(--fg)">Последние визиты</h3>
        </div>
        <Link href="/activs" className="text-xs font-medium text-(--primary-text) hover:underline">
          Все визиты
        </Link>
      </div>
      <StaggerList>
        {recent.map((a, i) => (
          <StaggerItem key={a.activId}>
            <Link
              href={`/activs/${a.activId}`}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-(--surface-raised) ${
                i > 0 ? 'border-t border-(--border)' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-(--fg)">{a.orgName}</p>
                <p className="mt-0.5 text-xs text-(--fg-muted)">
                  {formatShort(a.start)}
                  {' · '}
                  {a.usrLogin}
                </p>
              </div>
              <StatusBadge name={a.statusName} />
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dashData, loading } = useApi(
    'dashboard',
    () =>
      Promise.all([
        activsApi.getAll(1, 5, undefined, 'start', true),
        orgsApi.getAll(),
        physesApi.getAll(),
      ]).then(([activsRes, orgsRes, physesRes]) => ({
        activs: activsRes.data.items,
        activsCount: activsRes.data.totalCount,
        orgsCount: orgsRes.data.totalCount,
        physesCount: physesRes.data.totalCount,
      })),
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? 'Доброй ночи'
      : hour < 12
        ? 'Доброе утро'
        : hour < 18
          ? 'Добрый день'
          : 'Добрый вечер';
  const name = user?.firstName ?? user?.login ?? '';

  return (
    <PageTransition className="space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl border border-(--border) px-6 py-8"
        style={{ background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-(--fg)">
            {greeting}
            {name ? `, ${name}` : ''}
          </h2>
          <p className="mt-1.5 text-sm text-(--fg-muted)">Вот что происходит в вашей CRM сегодня</p>
        </div>
      </div>

      <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard
            loading={loading}
            label="Визиты"
            value={dashData?.activsCount ?? 0}
            href="/activs"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            loading={loading}
            label="Организации"
            value={dashData?.orgsCount ?? 0}
            href="/orgs"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            loading={loading}
            label="Врачи"
            value={dashData?.physesCount ?? 0}
            href="/physes"
          />
        </StaggerItem>
      </StaggerList>

      {!loading && dashData && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatusChart activs={dashData.activs} />
          <RecentActivs activs={dashData.activs} />
        </div>
      )}
    </PageTransition>
  );
}
