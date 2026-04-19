import { useMemo } from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { activsApi } from '@/lib/api/activs';
import type { ActivResponse } from '@/lib/api/types';
import { addDays, toDateKey } from '../../_lib/date';
import type { CalendarView } from '../_components/CalendarToolbar';

const PAGE_SIZE = 500;

function rangeFor(view: CalendarView, year: number, month: number, weekStart: Date) {
  const [from, to] =
    view === 'month'
      ? [new Date(year, month, 1), new Date(year, month + 1, 0, 23, 59, 59)]
      : [weekStart, addDays(weekStart, 6)];
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);
  return { from, to: toEnd };
}

function groupByDay(activs: ActivResponse[] | null): Map<string, ActivResponse[]> {
  const map = new Map<string, ActivResponse[]>();
  if (!activs) return map;
  for (const a of activs) {
    if (!a.start) continue;
    const key = toDateKey(new Date(a.start));
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  for (const arr of map.values()) {
    arr.sort((x, y) => {
      const xs = x.start ? new Date(x.start).getTime() : 0;
      const ys = y.start ? new Date(y.start).getTime() : 0;
      return xs - ys;
    });
  }
  return map;
}

export function useCalendarData({
  view,
  year,
  month,
  weekStart,
  usrId,
}: {
  view: CalendarView;
  year: number;
  month: number;
  weekStart: Date;
  usrId: number | undefined;
}) {
  const cacheKey =
    view === 'month' ? `${year}-${month}` : toDateKey(weekStart);

  const { data: activs, loading } = useApi(
    ['calendar-activs', view, cacheKey, usrId],
    () => {
      const { from, to } = rangeFor(view, year, month, weekStart);
      return activsApi
        .getAll(1, PAGE_SIZE, undefined, 'start', false, undefined,
          from.toISOString(), to.toISOString(), usrId)
        .then((r) => r.data.items);
    },
    { keepPreviousData: true },
  );

  const activsByDay = useMemo(() => groupByDay(activs ?? null), [activs]);

  return { activs, activsByDay, loading };
}
