'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/motion';
import {
  ShieldCheck,
  Users,
  Pill,
  GraduationCap,
  Building,
  History,
  ArrowRight,
} from 'lucide-react';
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

function toneRing(tone: 'primary' | 'success' | 'warning' | 'default', active: boolean) {
  if (!active) return 'bg-muted text-muted-foreground ring-border';
  switch (tone) {
    case 'primary':
      return 'bg-primary/10 text-primary ring-primary/20';
    case 'success':
      return 'bg-success/10 text-success ring-success/20';
    case 'warning':
      return 'bg-warning/15 text-warning ring-warning/25';
    default:
      return 'bg-foreground/10 text-foreground ring-foreground/20';
  }
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
        icon={ShieldCheck}
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
              className={`group relative flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-left transition-all duration-200 ${
                active
                  ? 'border-primary/40 bg-card ring-primary/20 shadow-sm ring-1'
                  : 'border-border bg-card/50 hover:border-border hover:bg-card'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors ${toneRing(
                  t.tone,
                  active,
                )}`}
              >
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {t.label}
                </p>
                <p className="text-muted-foreground/80 hidden truncate text-[10px] sm:block">
                  {t.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Link
        href="/admin/audit-log"
        className="group border-border bg-card hover:border-warning/40 hover:bg-warning/5 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-colors"
      >
        <div className="bg-warning/15 ring-warning/25 flex h-9 w-9 items-center justify-center rounded-xl ring-1">
          <History size={15} className="text-warning" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-semibold">Аудит-лог</p>
          <p className="text-muted-foreground/80 text-[10px]">Кто, когда и какое поле изменил</p>
        </div>
        <ArrowRight
          size={14}
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
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
