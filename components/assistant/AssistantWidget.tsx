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
          'group fixed right-5 bottom-5 z-50 flex size-13 cursor-pointer items-center justify-center rounded-xl transition-colors',
          'bg-card text-foreground border-border border shadow-lg',
          'hover:bg-accent active:bg-accent/80',
        )}
      >
        <span
          className={cn(
            'ring-border/60 absolute inset-0 rounded-xl ring-1 transition-opacity ring-inset',
            'opacity-0 group-hover:opacity-100',
          )}
        />
        {open ? (
          <X className="relative size-5 transition-transform duration-300" />
        ) : (
          <Sparkles
            className={cn(
              'relative size-5 transition-transform duration-300',
              chat.isStreaming && 'text-primary',
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
