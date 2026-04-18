import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { orgsApi } from '@/lib/api/orgs';
import { physesApi } from '@/lib/api/physes';
import { startOfDay } from '../../_lib/date';
import { HEATMAP_DAYS } from './heatmap';

const ACTIVS_PAGE_SIZE = 1000;

export function useDashboardSummary(usrId: number | undefined) {
  return useApi(
    ['dashboard-summary', usrId],
    () =>
      Promise.all([
        activsApi.getAll(1, 1, undefined, 'start', true, undefined, undefined, undefined, usrId),
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
  return useApi(['dashboard-my-activs', usrId], () => {
    const to = new Date();
    const fromDay = startOfDay(new Date());
    fromDay.setDate(fromDay.getDate() - (HEATMAP_DAYS - 1));
    to.setHours(23, 59, 59, 999);
    return activsApi
      .getAll(
        1, ACTIVS_PAGE_SIZE, undefined, 'start', true, undefined,
        fromDay.toISOString(), to.toISOString(), usrId,
      )
      .then((r) => r.data.items);
  });
}
