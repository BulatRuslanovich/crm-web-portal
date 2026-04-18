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
      <ThemeToggle />

      <div className="animate-fade-in relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center justify-center rounded-xl">
            <Image src="/icon.svg" width={82} height={32} alt="icon" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pharmo CRM</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Система управления визитами</p>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">{children}</div>
      </div>
    </div>
  );
}
