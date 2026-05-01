'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CLICKS_TO_ACTIVATE = 5;
const RESET_DELAY_MS = 1500;

export function SidebarHeader({
  compact,
  onNavigate,
}: {
  compact: boolean;
  onNavigate: () => void;
}) {
  const [party, setParty] = useState(false);
  const clickCount = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    clickCount.current += 1;

    if (clickCount.current === CLICKS_TO_ACTIVATE) {
      clickCount.current = 0;
      setParty(true);
      toast('Либо ты getname, либо ты просто кликаешь куда попало 🤨', {
        description: 'Pharmo CRM · сделано с душой',
        duration: 4000,
      });
      setTimeout(() => setParty(false), 700);
    } else {
      resetTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, RESET_DELAY_MS);
    }
  }

  return (
    <div
      className={cn(
        'border-sidebar-border flex h-14 shrink-0 items-center border-b',
        compact ? 'justify-center' : 'px-4',
      )}
    >
      <Link
        href="/dashboard"
        onClick={() => {
          handleLogoClick();
          onNavigate();
        }}
        className="flex min-w-0 items-center gap-2.5"
      >
        <div
          className={cn(
            'from-primary/10 to-primary/5 ring-primary/20 relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ring-1',
            party && 'animate-logo-party',
          )}
        >
          <Image src="/icon.svg" width={30} height={30} alt="Pharmo" />
        </div>
        {!compact && (
          <div className="min-w-0">
            <p className="text-sidebar-foreground truncate text-sm font-bold tracking-tight">
              Pharmo CRM
            </p>
          </div>
        )}
      </Link>
    </div>
  );
}
