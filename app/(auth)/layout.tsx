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
      <ThemeToggle />

      <div className="animate-fade-in relative z-10 w-full max-w-[380px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image src="/icon.svg" width={36} height={36} alt="Pharmo" className="mb-5" />
          <h1 className="text-foreground text-[22px] font-semibold tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground mt-1 text-[13px]">
            Система управления визитами
          </p>
        </div>

        <div className="border-border bg-card overflow-hidden rounded-xl border">
          {children}
        </div>

        <p className="text-muted-foreground/60 mt-8 text-center text-[11px] tracking-tight">
          © {APP_YEAR} {APP_NAME} · v{APP_VERSION} ·{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground hover:underline">
            Поддержка
          </a>
        </p>
      </div>
    </div>
  );
}
