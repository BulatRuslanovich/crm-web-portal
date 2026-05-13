import { useEffect, useState } from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import { startOfDay } from '@/lib/date';
import { HEATMAP_DAYS } from './heatmap';
import { fetchAllActivPages, type ActivsPageLoadResult } from './api/activ-pages';

export function useDashboardSummary(usrId: number | undefined) {
  return useApi(['dashboard-summary', usrId], () =>
    Promise.all([
      activsApi.getAll({ pageSize: 1, sortBy: 'start', sortDesc: true, usrId }),
      orgsApi.getAll(1, 1),
      physesApi.getAll(1, 1),
    ]).then(([activsRes, orgsRes, physesRes]) => ({
      activsCount: activsRes.data.totalCount,
      orgsCount: orgsRes.data.totalCount,
      physesCount: physesRes.data.totalCount,
    })),
  );
}

export function useDashboardActivs(usrId: number | undefined) {
  const [data, setData] = useState<ActivsPageLoadResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const fromDay = startOfDay(new Date());
    fromDay.setDate(fromDay.getDate() - (HEATMAP_DAYS - 1));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchAllActivPages(
      {
        sortBy: 'start',
        sortDesc: true,
        dateFrom: fromDay.toISOString(),
        dateTo: to.toISOString(),
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
  }, [usrId]);

  return { data: data?.items ?? [], loading, meta: data };
}

export function useDashboardWorkQueue(usrId: number | undefined) {
  return useApi(['dashboard-work-queue', usrId], () => {
    const from = startOfDay(new Date());
    from.setDate(from.getDate() - 7);

    const to = startOfDay(new Date());
    to.setDate(to.getDate() + 14);
    to.setHours(23, 59, 59, 999);

    return activsApi
      .getAll({
        pageSize: 100,
        sortBy: 'start',
        sortDesc: false,
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
        usrId,
      })
      .then((res) => res.data);
  });
}
