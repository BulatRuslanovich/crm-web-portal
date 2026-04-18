import { startOfDay, subDays } from 'date-fns';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';

const PAGE_SIZE = 1000;

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
    async () => {
      const to = new Date().toISOString();
      const from = subDays(startOfDay(new Date()), periodDays - 1).toISOString();
      const r = await activsApi.getAll(
        1, PAGE_SIZE, undefined, 'start', true, undefined, from, to, usrId,
      );
      return r.data.items;
    },
    { keepPreviousData: true },
  );

  return { activs: data ?? [], loading };
}
