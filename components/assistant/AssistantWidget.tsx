'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssistantChat } from '@/lib/hooks/use-assistant-chat';
import { AssistantPanel } from './AssistantPanel';

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const chat = useAssistantChat();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Закрыть ассистента' : 'Открыть ассистента'}
        className={cn(
          'group fixed right-5 bottom-5 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full transition-all duration-300',
          'bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--primary)_85%,white)_0%,var(--primary)_55%,color-mix(in_oklab,var(--primary)_70%,black)_100%)]',
          'text-primary-foreground',
          'hover:scale-110 active:scale-95',
          open
            ? 'shadow-[0_8px_20px_-6px_color-mix(in_oklab,var(--primary)_50%,transparent)]'
            : 'animate-assistant-glow',
        )}
      >
        <span
          className={cn(
            'absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 transition-opacity',
            'opacity-0 group-hover:opacity-100',
          )}
        />
        {open ? (
          <X className="relative size-5 transition-transform duration-300" />
        ) : (
          <Sparkles
            className={cn(
              'relative size-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-transform duration-300',
              chat.isStreaming && 'animate-spin-slow',
            )}
          />
        )}

        {chat.isStreaming && !open && (
          <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center">
            <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            <span className="bg-success ring-card relative inline-flex size-2.5 rounded-full ring-2" />
          </span>
        )}
      </button>

      <AssistantPanel open={open} onClose={() => setOpen(false)} chat={chat} />
    </>
  );
}
