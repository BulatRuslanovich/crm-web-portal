'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import { PageTransition, StaggerList, StaggerItem, HoverCard } from '@/components/motion';
import { Skeleton } from '@/components/ui';

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
    </PageTransition>
  );
}
