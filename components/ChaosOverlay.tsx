'use client';

import { useCallback, useEffect, useState } from 'react';
import { useKonami } from '@/lib/hooks/use-konami';

const CHAOS_EMOJIS = ['💀','💀','💀','💀','💀'];
const CHAOS_DURATION_MS = 8000;

export function ChaosOverlay() {
  const [active, setActive] = useState(false);

  const activate = useCallback(() => {
    if (active) return;
    setActive(true);
    document.documentElement.classList.add('chaos-mode');
  }, [active]);

  useKonami(activate);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      setActive(false);
      document.documentElement.classList.remove('chaos-mode');
    }, CHAOS_DURATION_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="animate-chaos-appear flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-background/90 px-10 py-8 shadow-2xl backdrop-blur-sm">
        <div className="flex gap-2 text-4xl">
          {CHAOS_EMOJIS.map((e, i) => (
            <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 80}ms` }}>
              {e}
            </span>
          ))}
        </div>
        <p className="text-2xl font-black tracking-widest text-primary uppercase">
          Как ты это нашёл без исходников, хакер ты ебанный
        </p>
        <p className="text-xs text-muted-foreground">
          Cheats Activated
        </p>
      </div>
    </div>
  );
}
