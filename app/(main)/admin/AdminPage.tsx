'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/motion';
import {
  ShieldCheck,
  Users,
  Pill,
  GraduationCap,
  Building,
} from 'lucide-react';
import { UsersSection } from './UsersSection';
import { DepartmentsSection } from './DepartmentsSection';
import { DrugsSection } from './DrugsSection';
import { SpecsSection } from './SpecsSection';

type Tab = 'users' | 'drugs' | 'specs' | 'departments';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.policies?.includes('Admin');
  const [tab, setTab] = useState<Tab>('users');

  useEffect(() => {
    if (user && !isAdmin) router.push('/dashboard');
  }, [user, isAdmin, router]);

  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'users', label: 'Пользователи', icon: Users },
    { key: 'departments', label: 'Департаменты', icon: Building },
    { key: 'drugs', label: 'Препараты', icon: Pill },
    { key: 'specs', label: 'Специальности', icon: GraduationCap },
  ];

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--violet-subtle)">
          <ShieldCheck size={18} className="text-(--violet-text)" />
        </div>
        <h2 className="text-xl font-bold text-(--fg)">Администрирование</h2>
      </div>

      <div className="mb-5 flex gap-1 rounded-xl border border-(--border) bg-(--surface-raised) p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? 'bg-(--surface) text-(--fg) shadow-sm'
                  : 'text-(--fg-muted) hover:text-(--fg)'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'users' && <UsersSection />}
      {tab === 'departments' && <DepartmentsSection />}
      {tab === 'drugs' && <DrugsSection />}
      {tab === 'specs' && <SpecsSection />}
    </PageTransition>
  );
}
