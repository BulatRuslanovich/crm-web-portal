import { format, startOfDay, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ActivResponse } from '@/lib/api/types';
import { STATUS_CLOSED } from '@/lib/api/statuses';

export interface DailyPoint {
  date: string;
  count: number;
  closed: number;
}

export function buildDailyData(activs: ActivResponse[], periodDays: number): DailyPoint[] {
  const today = startOfDay(new Date());
  const days: DailyPoint[] = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    days.push({ date: format(subDays(today, i), 'dd.MM', { locale: ru }), count: 0, closed: 0 });
  }

  for (const a of activs) {
    if (!a.start) continue;
    const key = format(startOfDay(new Date(a.start)), 'dd.MM', { locale: ru });
    const idx = days.findIndex((x) => x.date === key);
    if (idx === -1) continue;
    days[idx].count++;
    if (a.statusId === STATUS_CLOSED) days[idx].closed++;
  }
  return days;
}

export function topN<T extends string>(
  items: ActivResponse[],
  keyFn: (a: ActivResponse) => T | T[] | null,
  n = 10,
): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const a of items) {
    const v = keyFn(a);
    if (!v) continue;
    const keys = Array.isArray(v) ? v : [v];
    for (const key of keys) {
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export function buildByUsr(activs: ActivResponse[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const a of activs) {
    map.set(a.usrLogin, (map.get(a.usrLogin) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function buildByStatus(activs: ActivResponse[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const a of activs) {
    map.set(a.statusName, (map.get(a.statusName) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export interface Summary {
  total: number;
  closed: number;
  closedPct: number;
  avgPerDay: string;
  uniqueOrgs: number;
  uniquePhyses: number;
}

export function buildSummary(activs: ActivResponse[], periodDays: number): Summary {
  const total = activs.length;
  const closed = activs.filter((a) => a.statusId === STATUS_CLOSED).length;
  const closedPct = total > 0 ? Math.round((closed / total) * 100) : 0;
  const avgPerDay = total > 0 ? (total / periodDays).toFixed(1) : '0';
  const uniqueOrgs = new Set(activs.map((a) => a.orgId).filter(Boolean)).size;
  const uniquePhyses = new Set(activs.map((a) => a.physId).filter(Boolean)).size;
  return { total, closed, closedPct, avgPerDay, uniqueOrgs, uniquePhyses };
}
