'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { ChaosOverlay } from '@/components/ChaosOverlay';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { resolvedTheme } = useTheme();
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
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="animate-fade-in flex w-full max-w-xs flex-col items-center gap-5">
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border">
            <Image src="/icon.svg" width={52} height={52} alt="Pharmo" priority />
            <div className="absolute -inset-1 rounded-[1.25rem] border border-primary/20" />
          </div>

          <div className="w-full space-y-3 text-center">
            <div>
              <p className="text-sm font-bold tracking-tight text-foreground">Pharmo CRM</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Подготовка рабочего пространства</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
              <span className="h-1.5 rounded-full bg-primary" />
              <span className="animate-skeleton h-1.5 rounded-full bg-primary/60" />
              <span className="animate-skeleton h-1.5 rounded-full bg-primary/25 [animation-delay:180ms]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <ChaosOverlay />
      <Toaster position="top-right" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
      <main
        className={`px-4 py-6 pt-16 transition-all duration-300 sm:px-6 md:pt-6 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}
      >
        <div className="animate-fade-in mx-auto max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
