import { useEffect, useState } from 'react';
import { fetchAllActivPages, type ActivsPageLoadResult } from '@/lib/api/activ-pages';
import { toIso } from './date';

export function useReportsData({
  enabled,
  dateFrom,
  dateTo,
  statusFilter,
  usrId,
}: {
  enabled: boolean;
  dateFrom: string;
  dateTo: string;
  statusFilter: number[];
  usrId: number | undefined;
}) {
  const [data, setData] = useState<ActivsPageLoadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const statusKey = statusFilter.join(',');

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetchAllActivPages(
      {
        sortBy: 'start',
        statuses: statusFilter.length > 0 ? statusFilter : undefined,
        dateFrom: toIso(dateFrom, false),
        dateTo: toIso(dateTo, true),
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
    // statusKey is the stable dependency for the statusFilter array contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, dateFrom, dateTo, statusKey, usrId]);

  return { data: data?.items ?? [], loading, meta: data };
}
