'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />

      <ThemeToggle />

      <div className="animate-fade-in relative z-10 w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Image src="/icon.svg" width={32} height={32} alt="icon" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pharmo CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Система управления визитами</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
