'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight, Check, Clock, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProposedAction } from '@/lib/hooks/use-assistant-chat';
import { ACTIV_ICON, getToolMeta } from './tool-meta';

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'истёк';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} с`;
  return `${min} мин ${sec.toString().padStart(2, '0')} с`;
}

interface Props {
  action: ProposedAction;
  onConfirm: () => void;
  onDismiss: () => void;
  onNavigate?: () => void;
}

export function AssistantActionCard({ action, onConfirm, onDismiss, onNavigate }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const meta = getToolMeta(action.tool);
  const Icon = meta.icon;

  const isPending = action.status === 'awaiting_confirmation';
  const isExecuting = action.status === 'executing_action';
  const isDone = action.status === 'action_done';
  const isFailed = action.status === 'action_failed';

  useEffect(() => {
    if (!isPending) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isPending]);

  if (action.status === 'dismissed') return null;

  if (isDone && action.result) {
    return (
      <div className="animate-fade-in border-success/30 bg-card relative overflow-hidden rounded-xl border p-3">
        <div className="flex items-start gap-2.5">
          <div className="bg-success/20 text-success ring-success/30 flex size-9 shrink-0 items-center justify-center rounded-full ring-1">
            <Check className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-foreground text-sm font-semibold">
              Визит #{action.result.activId} создан
            </div>
            <div className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
              {action.summary}
            </div>
            <Link
              href={`/activs/${action.result.activId}`}
              onClick={onNavigate}
              className="text-primary hover:bg-primary/10 mt-2 -ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
            >
              Открыть визит
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const remaining = action.expiresAt - now;
  const expired = isPending && remaining <= 0;

  return (
    <div
      className={cn(
        'animate-fade-in bg-card relative overflow-hidden rounded-xl border p-3',
        isFailed ? 'border-destructive/40' : 'border-primary/25',
      )}
    >
      <div
        aria-hidden
        className={cn('absolute inset-y-0 left-0 w-1', isFailed ? 'bg-destructive' : 'bg-primary')}
      />

      <div className="flex items-start gap-2.5 pl-1.5">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full ring-1',
            isFailed
              ? 'bg-destructive/15 text-destructive ring-destructive/25'
              : 'bg-primary/15 text-primary ring-primary/25',
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <ACTIV_ICON className="text-muted-foreground size-3" />
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              {meta.doneLabel}
            </span>
            {isPending && !expired && (
              <span
                className={cn(
                  'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  remaining < 60_000
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <Clock className="size-2.5" />
                {formatRemaining(remaining)}
              </span>
            )}
          </div>
          <div className="text-foreground mt-1 text-sm leading-snug">{action.summary}</div>

          {isFailed && action.error && (
            <div className="text-destructive bg-destructive/5 border-destructive/20 mt-2 flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-[11px]">
              <AlertCircle className="mt-0.5 size-3 shrink-0" />
              <span>{action.error}</span>
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              onClick={onConfirm}
              disabled={isExecuting || expired}
              className={cn(
                'h-8 gap-1.5 px-3 text-xs font-semibold',
                !isFailed && !isExecuting && 'bg-primary hover:bg-primary/90',
              )}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Создаём…
                </>
              ) : isFailed ? (
                <>
                  <Check className="size-3.5" />
                  Повторить
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Подтвердить
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              disabled={isExecuting}
              className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2.5 text-xs"
            >
              <X className="size-3.5" />
              Отмена
            </Button>
            {expired && (
              <span className="text-destructive ml-auto text-[11px] font-medium">
                Черновик истёк
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
