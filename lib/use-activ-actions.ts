'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { activsApi } from '@/lib/api/activs';
import {
  STATUS_CANCELED,
  STATUS_CLOSED,
  STATUS_OPEN,
  STATUS_SAVED,
} from '@/lib/api/statuses';
import {
  GeolocationError,
  describeGeoFailure,
  getCurrentPosition,
  type GeoFailureReason,
} from '@/lib/hooks/use-geolocation';
import type { ActivResponse, UpdateActivRequest } from '@/lib/api/types';
import { useGeoCloseDialog } from '@/components/GeoCloseDialog';

const STATUS_TOAST: Record<number, { label: string; icon: string }> = {
  [STATUS_OPEN]:     { label: 'Визит открыт',    icon: '🟡' },
  [STATUS_SAVED]:    { label: 'Визит сохранён',   icon: '🔵' },
  [STATUS_CLOSED]:   { label: 'Визит закрыт',     icon: '✅' },
  [STATUS_CANCELED]: { label: 'Визит отменён',    icon: '🚫' },
};

const ACCURACY_WARN_METERS = 200;

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
  const geoDialog = useGeoCloseDialog();

  async function setStatus(statusId: number, overrides: Overrides = {}) {
    setActing(true);
    try {
      await applyUpdate({
        statusId,
        start: overrides.start !== undefined ? overrides.start : activ.start,
        end: overrides.end !== undefined ? overrides.end : activ.end,
        description: activ.description,
      });
      notifyStatus(statusId);
    } finally {
      setActing(false);
    }
  }

  async function closeWithGeo() {
    setActing(true);
    try {
      const endIso = new Date().toISOString();

      while (true) {
        try {
          const point = await getCurrentPosition();
          await applyUpdate({
            statusId: STATUS_CLOSED,
            start: activ.start,
            end: endIso,
            description: activ.description,
            latitude: point.latitude,
            longitude: point.longitude,
          });
          notifyStatus(STATUS_CLOSED);
          if (point.accuracy > ACCURACY_WARN_METERS) {
            toast.warning(
              `Низкая точность геолокации: ±${Math.round(point.accuracy)} м`,
            );
          }
          return;
        } catch (err) {
          const reason: GeoFailureReason =
            err instanceof GeolocationError ? err.reason : 'unknown';
          const choice = await geoDialog.ask(
            `${describeGeoFailure(reason)}. Завершить визит без координат или повторить попытку?`,
          );
          if (choice === 'cancel') return;
          if (choice === 'without') {
            await applyUpdate({
              statusId: STATUS_CLOSED,
              start: activ.start,
              end: endIso,
              description: activ.description,
              latitude: null,
              longitude: null,
            });
            notifyStatus(STATUS_CLOSED);
            toast('Визит закрыт без координат');
            return;
          }
        }
      }
    } finally {
      setActing(false);
    }
  }

  async function applyUpdate(payload: UpdateActivRequest) {
    await activsApi.update(activ.activId, payload);
    await reload();
  }

  function notifyStatus(statusId: number) {
    const t = STATUS_TOAST[statusId];
    if (t) toast(`${t.icon} ${t.label}`);
  }

  return { acting, setStatus, closeWithGeo, geoDialog: geoDialog.dialog };
}
