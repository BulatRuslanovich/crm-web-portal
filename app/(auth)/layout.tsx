'use client';

import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { APP_NAME, APP_VERSION, APP_YEAR, SUPPORT_EMAIL } from '@/lib/app-info';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(next)}
      className="absolute top-5 right-5"
    >
      <Icon />
    </Button>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* decorative blobs */}
      <div
        className="bg-primary/15 pointer-events-none absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full blur-3xl dark:bg-primary/20"
        aria-hidden
      />
      <div
        className="bg-violet-500/10 pointer-events-none absolute -right-32 -bottom-40 h-[420px] w-[420px] rounded-full blur-3xl dark:bg-violet-500/15"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />

      <ThemeToggle />

      <div className="animate-fade-in relative z-10 w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="bg-primary/10 ring-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1">
            <Image src="/icon.svg" width={56} height={56} alt="Pharmo" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Система управления визитами</p>
        </div>

        <div className="border-border bg-card overflow-hidden rounded-xl border shadow-lg">
          {children}
        </div>

        <p className="text-muted-foreground/70 mt-6 text-center text-xs">
          © {APP_YEAR} {APP_NAME} · v{APP_VERSION} ·{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground hover:underline">
            Поддержка
          </a>
        </p>
      </div>
    </div>
  );
}
