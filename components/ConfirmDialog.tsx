'use client';

import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { BtnDanger, BtnSecondary } from '@/components/ui';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
}

interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<DialogState | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, resolve });
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    setState(null);
  }, []);

  const dialog = state
    ? createPortal(
        <ConfirmDialog
          title={state.title}
          description={state.description}
          confirmLabel={state.confirmLabel}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />,
        document.body,
      )
    : null;

  return { confirm, dialog };
}

function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Удалить',
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* card */}
      <div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-150">
        {/* top accent */}
        <div className="border-b border-border bg-destructive/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
              <AlertTriangle size={16} className="text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {description && (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>

        {/* actions */}
        <div className="flex justify-end gap-2 px-5 py-3.5">
          <BtnSecondary type="button" onClick={onCancel}>
            Отмена
          </BtnSecondary>
          <BtnDanger type="button" onClick={onConfirm}>
            {confirmLabel}
          </BtnDanger>
        </div>
      </div>
    </div>
  );
}
