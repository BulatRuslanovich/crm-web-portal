import { startOfDay, subDays } from 'date-fns';
import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';

export function useAnalyticsData({
  enabled,
  periodDays,
  usrId,
}: {
  enabled: boolean;
  periodDays: number;
  usrId: number | undefined;
}) {
  const { data, loading } = useApi(
    enabled ? ['analytics-activs', periodDays, usrId] : null,
    () =>
      activsApi
        .getAll({
          pageSize: 1000,
          sortBy: 'start',
          sortDesc: true,
          dateFrom: subDays(startOfDay(new Date()), periodDays - 1).toISOString(),
          dateTo: new Date().toISOString(),
          usrId,
        })
        .then((r) => r.data.items),
    { keepPreviousData: true },
  );

  return { activs: data ?? [], loading };
}
