'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <button
      onClick={() => setTheme(next)}
      className="glass absolute top-5 right-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-(--border) text-(--fg-muted) transition-all duration-200 hover:border-(--fg-subtle)/30 hover:text-(--fg)"
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

function FloatingOrb({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full opacity-20 blur-3xl ${className}`}
      style={style}
    />
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'var(--gradient-auth)' }}
    >
      {/* Floating orbs for visual depth */}
      <FloatingOrb className="animate-float -top-48 -left-48 h-96 w-96 bg-(--primary)" />
      <FloatingOrb
        className="animate-float -right-40 -bottom-40 h-80 w-80 bg-(--success)"
        style={{ animationDelay: '1.5s' } as React.CSSProperties}
      />
      <FloatingOrb
        className="animate-float top-1/3 -right-32 h-64 w-64 bg-(--violet-text)"
        style={{ animationDelay: '3s' } as React.CSSProperties}
      />

      <ThemeToggle />

      <div className="animate-fade-in relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-(--fg)">Pharmo CRM</h1>
          <p className="mt-1.5 text-sm text-(--fg-muted)">Система управления визитами</p>
        </div>

        {/* Glass card wrapper */}
        <div className="glass rounded-2xl border border-(--border) shadow-lg">{children}</div>
      </div>
    </div>
  );
}
