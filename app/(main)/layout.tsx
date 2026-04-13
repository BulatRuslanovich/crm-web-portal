'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem('sidebar-collapsed', String(!v));
      return !v;
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg)">
        <div className="animate-fade-in flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--primary) shadow-lg">
              <span className="text-lg font-bold text-(--primary-fg)">P</span>
            </div>
            <div className="animate-skeleton absolute inset-0 rounded-2xl bg-(--primary) opacity-40" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-(--fg)">Pharmo CRM</p>
            <p className="text-xs text-(--fg-muted)">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-(--bg)">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main
        className={`px-4 py-6 pt-16 transition-all duration-300 sm:px-6 md:pt-6 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}
      >
        <div className="animate-fade-in mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
