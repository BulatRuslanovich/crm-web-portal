'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import type { ActivResponse } from '@/lib/api/types';
import { StatusBadge, Skeleton } from '@/components/ui';
import { CalendarCheck, Building2, Stethoscope, ArrowRight } from 'lucide-react';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [activs, setActivs] = useState<ActivResponse[]>([]);
  const [stats, setStats] = useState({ activs: 0, orgs: 0, physes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      activsApi.getAll(1, 50),
      orgsApi.getAll(1, 1),
      physesApi.getAll(1, 1),
    ]).then(([activsRes, orgsRes, physesRes]) => {
      setActivs(activsRes.data.items.slice(0, 5));
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
    <div className="max-w-4xl mx-auto space-y-8">
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
          ) : activs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-(--fg-muted)">Визитов пока нет</div>
          ) : (
            <div className="divide-y divide-(--border)">
              {activs.map((a) => (
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
