'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { activsApi } from '@/lib/api/activs';
import { STATUS_CLOSED, STATUS_OPEN, STATUS_SAVED } from '@/lib/api/statuses';
import type { ActivResponse } from '@/lib/api/types';

const STATUS_TOAST: Record<number, { label: string; icon: string }> = {
  [STATUS_OPEN]:   { label: 'Визит открыт',    icon: '🟡' },
  [STATUS_SAVED]:  { label: 'Визит сохранён',   icon: '🔵' },
  [STATUS_CLOSED]: { label: 'Визит закрыт',     icon: '✅' },
};

interface Params {
  activ: ActivResponse;
  reload: () => Promise<unknown>;
}

interface Overrides {
  start?: string;
  end?: string;
}

export function useActivActions({ activ, reload }: Params) {
  const [acting, setActing] = useState(false);

  async function setStatus(statusId: number, overrides: Overrides = {}) {
    setActing(true);
    try {
      await activsApi.update(activ.activId, {
        statusId,
        start: overrides.start !== undefined ? overrides.start : activ.start,
        end: overrides.end !== undefined ? overrides.end : activ.end,
        description: activ.description,
      });
      await reload();
      const t = STATUS_TOAST[statusId];
      if (t) toast(`${t.icon} ${t.label}`);
    } finally {
      setActing(false);
    }
  }

  return { acting, setStatus };
}

export function nowIso(): string {
  return new Date().toISOString();
}
