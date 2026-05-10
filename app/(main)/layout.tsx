'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { ChaosOverlay } from '@/components/ChaosOverlay';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';

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
      <div className="bg-background flex min-h-screen items-center justify-center px-6">
        <div className="animate-fade-in flex w-full max-w-xs flex-col items-center gap-5">
          <div className="bg-card ring-border relative flex size-16 items-center justify-center rounded-2xl shadow-sm ring-1">
            <Image src="/icon.svg" width={52} height={52} alt="Pharmo" priority />
            <div className="border-primary/20 absolute -inset-1 rounded-[1.25rem] border" />
          </div>

          <div className="w-full space-y-3 text-center">
            <div>
              <p className="text-foreground text-sm font-bold tracking-tight">Pharmo CRM</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Подготовка рабочего пространства
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
              <span className="bg-primary h-1.5 rounded-full" />
              <span className="animate-skeleton bg-primary/60 h-1.5 rounded-full" />
              <span className="animate-skeleton bg-primary/25 h-1.5 rounded-full [animation-delay:180ms]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-background min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <ChaosOverlay />
      <Toaster
        position="top-right"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        closeButton
        toastOptions={{
          classNames: {
            toast:
              '!border !border-border !bg-card !text-card-foreground !rounded-xl !shadow-lg !font-sans',
            title: '!text-sm !font-semibold !text-foreground',
            description: '!text-xs !text-muted-foreground',
            success: '!border-success/40',
            error: '!border-destructive/40',
            warning: '!border-warning/40',
            info: '!border-primary/40',
            closeButton:
              '!bg-card !border-border !text-muted-foreground hover:!text-foreground hover:!bg-muted',
          },
        }}
      />
      <main
        className={`px-4 py-6 pt-16 transition-all duration-300 sm:px-6 md:pt-6 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}
      >
        <div className="animate-fade-in mx-auto max-w-[1600px]">{children}</div>
      </main>
      <AssistantWidget />
    </div>
  );
}
