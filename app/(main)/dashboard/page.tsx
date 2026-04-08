'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import { StatusBadge, Skeleton } from '@/components/ui';
import { PageTransition, StaggerList, StaggerItem, HoverCard } from '@/components/motion';
import { CalendarCheck, Building2, Stethoscope, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ── helpers ──────────────────────────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  'запланирован': '#6366f1',
  'открыт':      '#d97706',
  'сохранен':    '#8b5cf6',
  'закрыт':      '#059669',
};

/* ── StatCard ─────────────────────────────────────────────────────────────── */

function StatCard({
  label, value, href, icon: Icon, color, loading,
}: {
  label: string; value: number; href: string;
  icon: React.ElementType; color: string; loading?: boolean;
}) {
  return (
    <HoverCard>
      <Link
        href={href}
        className="group bg-(--surface) border border-(--border) rounded-xl p-5 hover:border-(--primary-border) transition-all block"
        style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
      >
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={18} strokeWidth={1.75} />
          </div>
          <ArrowRight size={14} className="text-(--fg-subtle) group-hover:text-(--primary) group-hover:translate-x-0.5 transition-all" />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-4 mb-1" />
        ) : (
          <p className="text-3xl font-bold text-(--fg) mt-4 tabular-nums">{value.toLocaleString('ru-RU')}</p>
        )}
        <p className="text-sm text-(--fg-muted) mt-0.5">{label}</p>
      </Link>
    </HoverCard>
  );
}

/* ── StatusChart ──────────────────────────────────────────────────────────── */

function StatusChart({ activs }: { activs: ActivResponse[] }) {
  const counts = new Map<string, number>();
  for (const a of activs) {
    counts.set(a.statusName, (counts.get(a.statusName) ?? 0) + 1);
  }
  const data = [...counts.entries()].map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} className="text-(--fg-muted)" />
        <h3 className="text-sm font-semibold text-(--fg)">По статусам</h3>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={STATUS_COLORS[d.name.toLowerCase()] ?? '#94a3b8'} />
                ))}
              </Pie>
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
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: STATUS_COLORS[d.name.toLowerCase()] ?? '#94a3b8' }}
                />
                <span className="text-(--fg-muted)">{d.name}</span>
              </div>
              <span className="font-semibold text-(--fg) tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── RecentActivs ─────────────────────────────────────────────────────────── */

function RecentActivs({ activs }: { activs: ActivResponse[] }) {
  const recent = activs.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-(--fg-muted)" />
          <h3 className="text-sm font-semibold text-(--fg)">Последние визиты</h3>
        </div>
        <Link href="/activs" className="text-xs text-(--primary-text) hover:underline">
          Все визиты
        </Link>
      </div>
      <StaggerList>
        {recent.map((a, i) => (
          <StaggerItem key={a.activId}>
            <Link
              href={`/activs/${a.activId}`}
              className={`flex items-center justify-between px-5 py-3 hover:bg-(--surface-raised) transition-colors gap-3 ${
                i > 0 ? 'border-t border-(--border)' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-(--fg) truncate">{a.orgName}</p>
                <p className="text-xs text-(--fg-muted) mt-0.5">
                  {a.start
                    ? new Date(a.start).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Без даты'}
                  {' · '}{a.usrLogin}
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

/* ── DashboardPage ────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dashData, loading } = useApi(() =>
    Promise.all([
      activsApi.getAll(1, 100),
      orgsApi.getAll(1, 100),
      physesApi.getAll(1, 100),
    ]).then(([activsRes, orgsRes, physesRes]) => ({
      activs: activsRes.data.items,
      activsCount: activsRes.data.totalCount,
      orgsCount: orgsRes.data.totalCount,
      physesCount: physesRes.data.totalCount,
    })),
  );

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const name = user?.firstName ?? user?.login ?? '';

  return (
    <PageTransition className="space-y-6">
      {/* Hero greeting */}
      <div
        className="rounded-2xl px-6 py-8 border border-(--border)"
        style={{ background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-sm)' }}
      >
        <h2 className="text-2xl font-bold text-(--fg)">
          {greeting}{name ? `, ${name}` : ''}
        </h2>
        <p className="text-sm text-(--fg-muted) mt-1">Вот что происходит в вашей CRM сегодня</p>
      </div>

      {/* Stat cards */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StaggerItem>
          <StatCard loading={loading} label="Визиты" value={dashData?.activsCount ?? 0} href="/activs" icon={CalendarCheck} color="bg-(--primary-subtle) text-(--primary-text)" />
        </StaggerItem>
        <StaggerItem>
          <StatCard loading={loading} label="ЛПУ" value={dashData?.orgsCount ?? 0} href="/orgs" icon={Building2} color="bg-(--success-subtle) text-(--success-text)" />
        </StaggerItem>
        <StaggerItem>
          <StatCard loading={loading} label="Врачи" value={dashData?.physesCount ?? 0} href="/physes" icon={Stethoscope} color="bg-(--warn-subtle) text-(--warn-text)" />
        </StaggerItem>
      </StaggerList>

      {/* Charts + Recent */}
      {!loading && dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatusChart activs={dashData.activs} />
          <RecentActivs activs={dashData.activs} />
        </div>
      )}
    </PageTransition>
  );
}
