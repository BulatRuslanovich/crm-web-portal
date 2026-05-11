'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/motion';
import { Users, Pill, GraduationCap, Building, History, ArrowRight } from 'lucide-react';
import { UsersSection } from './UsersSection';
import { DepartmentsSection } from './DepartmentsSection';
import { DrugsSection } from './DrugsSection';
import { SpecsSection } from './SpecsSection';
import { Hero } from '@/components/Hero';

type Tab = 'users' | 'drugs' | 'specs' | 'departments';

const TABS: {
  key: Tab;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  tone: 'primary' | 'success' | 'warning' | 'default';
}[] = [
  {
    key: 'users',
    label: 'Пользователи',
    subtitle: 'Учётные записи и роли',
    icon: Users,
    tone: 'primary',
  },
  {
    key: 'departments',
    label: 'Департаменты',
    subtitle: 'Состав и видимость',
    icon: Building,
    tone: 'success',
  },
  {
    key: 'drugs',
    label: 'Препараты',
    subtitle: 'Справочник препаратов',
    icon: Pill,
    tone: 'warning',
  },
  {
    key: 'specs',
    label: 'Специальности',
    subtitle: 'Справочник специальностей',
    icon: GraduationCap,
    tone: 'default',
  },
];

function toneRing(_tone: 'primary' | 'success' | 'warning' | 'default', active: boolean) {
  return active ? 'text-foreground' : 'text-muted-foreground/60';
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.policies?.includes('Admin');
  const [tab, setTab] = useState<Tab>('users');

  useEffect(() => {
    if (user && !isAdmin) router.push('/dashboard');
  }, [user, isAdmin, router]);

  if (!isAdmin) return null;

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      <Hero
        kicker="Панель администратора"
        title="Администрирование"
        subtitle={activeTab.subtitle}
        tone="warning"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-200 ${
                active
                  ? 'border-foreground/20 bg-card'
                  : 'border-border bg-card/60 hover:bg-card'
              }`}
            >
              {active && (
                <span className="bg-primary absolute top-2 bottom-2 left-0 w-[2px] rounded-r-full" />
              )}
              <Icon
                size={15}
                strokeWidth={1.5}
                className={`shrink-0 transition-colors ${toneRing(t.tone, active)}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium tracking-tight ${
                    active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {t.label}
                </p>
                <p className="text-muted-foreground/70 hidden truncate text-[11px] sm:block">
                  {t.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/admin/audit-log"
        className="group border-border bg-card hover:bg-muted/40 flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors"
      >
        <History size={15} strokeWidth={1.5} className="text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium tracking-tight">Аудит-лог</p>
          <p className="text-muted-foreground/70 text-[11px]">Кто, когда и какое поле изменил</p>
        </div>
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      <div>
        {tab === 'users' && <UsersSection />}
        {tab === 'departments' && <DepartmentsSection />}
        {tab === 'drugs' && <DrugsSection />}
        {tab === 'specs' && <SpecsSection />}
      </div>
    </PageTransition>
  );
}
