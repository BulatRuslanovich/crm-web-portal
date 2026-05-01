import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';
import { toIso } from './date-range';

const PAGE_SIZE = 10000;

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
        .getAll(
          1, PAGE_SIZE, undefined, 'start', false,
          statusFilter.length > 0 ? statusFilter : undefined,
          toIso(dateFrom, false),
          toIso(dateTo, true),
          usrId,
        )
        .then((r) => r.data.items),
    { keepPreviousData: true },
  );
}
