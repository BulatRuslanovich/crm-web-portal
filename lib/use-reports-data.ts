import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';
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
  return useApi(
    enabled ? ['reports-activs', dateFrom, dateTo, statusFilter, usrId] : null,
    () =>
      activsApi
        .getAll({
          pageSize: 10000,
          sortBy: 'start',
          statuses: statusFilter.length > 0 ? statusFilter : undefined,
          dateFrom: toIso(dateFrom, false),
          dateTo: toIso(dateTo, true),
          usrId,
        })
        .then((r) => r.data.items),
    { keepPreviousData: true },
  );
}
