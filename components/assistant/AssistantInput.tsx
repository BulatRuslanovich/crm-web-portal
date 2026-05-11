'use client';

import { useEffect, useRef } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  disabled: boolean;
  isStreaming: boolean;
}

export function AssistantInput({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  isStreaming,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) onSubmit();
    }
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
      className={cn(
        'group border-input bg-background flex items-end gap-2 rounded-2xl border p-1.5 transition-all',
        'focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)]',
      )}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled && !isStreaming}
        rows={1}
        placeholder={isStreaming ? 'Идёт генерация ответа…' : 'Спросите ассистента…'}
        className={cn(
          'placeholder:text-muted-foreground/70 max-h-40 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm leading-relaxed outline-none disabled:opacity-60',
          'scrollbar-thin',
        )}
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Остановить"
          className={cn(
            'bg-destructive text-destructive-foreground flex size-8 cursor-pointer items-center justify-center rounded-full transition-transform',
            'hover:scale-105 active:scale-95',
          )}
        >
          <Square className="size-3 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Отправить"
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full transition-all',
            canSend
              ? 'bg-primary text-primary-foreground cursor-pointer hover:scale-105 hover:shadow-[0_4px_10px_-2px_color-mix(in_oklab,var(--primary)_45%,transparent)] active:scale-95'
              : 'bg-muted text-muted-foreground/50 cursor-not-allowed',
          )}
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </form>
  );
}
