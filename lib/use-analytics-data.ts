import { useEffect, useState } from 'react';
import { startOfDay, subDays } from 'date-fns';
import { fetchAllActivPages, type ActivsPageLoadResult } from '@/lib/api/activ-pages';

export function useAnalyticsData({
  enabled,
  periodDays,
  usrId,
}: {
  enabled: boolean;
  periodDays: number;
  usrId: number | undefined;
}) {
  const [data, setData] = useState<ActivsPageLoadResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchAllActivPages(
      {
        sortBy: 'start',
        sortDesc: true,
        dateFrom: subDays(startOfDay(new Date()), periodDays - 1).toISOString(),
        dateTo: new Date().toISOString(),
        usrId,
      },
      controller.signal,
    )
      .then((result) => {
        setData(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [enabled, periodDays, usrId]);

  return { activs: data?.items ?? [], loading, meta: data };
}
