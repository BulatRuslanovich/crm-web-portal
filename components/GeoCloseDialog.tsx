'use client';

import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPinOff } from 'lucide-react';
import { BtnPrimary, BtnSecondary } from '@/components/ui';

export type GeoCloseChoice = 'retry' | 'without' | 'cancel';

interface DialogState {
  message: string;
}

export function useGeoCloseDialog() {
  const [state, setState] = useState<DialogState | null>(null);
  const resolveRef = useRef<((c: GeoCloseChoice) => void) | null>(null);

  const ask = useCallback((message: string): Promise<GeoCloseChoice> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ message });
    });
  }, []);

  const close = useCallback((choice: GeoCloseChoice) => {
    resolveRef.current?.(choice);
    resolveRef.current = null;
    setState(null);
  }, []);

  const dialog = state
    ? createPortal(
        <Dialog
          message={state.message}
          onRetry={() => close('retry')}
          onWithout={() => close('without')}
          onCancel={() => close('cancel')}
        />,
        document.body,
      )
    : null;

  return { ask, dialog };
}

function Dialog({
  message,
  onRetry,
  onWithout,
  onCancel,
}: {
  message: string;
  onRetry: () => void;
  onWithout: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="animate-in fade-in absolute inset-0 bg-black/40 backdrop-blur-sm duration-150" />

      <div className="animate-in fade-in zoom-in-95 border-border bg-card relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl duration-150">
        <div className="border-border bg-warning/5 border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-warning/15 ring-warning/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1">
              <MapPinOff size={16} className="text-warning" />
            </div>
            <h3 className="text-foreground font-semibold">Координаты не записаны</h3>
          </div>
          <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 px-5 py-3.5">
          <BtnSecondary type="button" onClick={onCancel}>
            Отмена
          </BtnSecondary>
          <BtnSecondary type="button" onClick={onWithout}>
            Без координат
          </BtnSecondary>
          <BtnPrimary type="button" onClick={onRetry}>
            Повторить
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}
