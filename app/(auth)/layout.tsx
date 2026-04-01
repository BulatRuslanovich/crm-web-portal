'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <button
      onClick={() => setTheme(next)}
      className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface) transition-colors border border-(--border)"
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg) relative px-4">
      <ThemeToggle />
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--primary) mb-4 shadow-sm">
            <span className="text-2xl font-bold text-(--primary-fg)">P</span>
          </div>
          <h1 className="text-2xl font-bold text-(--fg)">Pharmo CRM</h1>
          <p className="text-sm text-(--fg-muted) mt-1">Система управления визитами</p>
        </div>
        {children}
      </div>
    </div>
  );
}
