import type { ActivResponse } from '@/lib/api/types';
import { STATUS_CLOSED } from '@/lib/api/statuses';
import { monBasedDow, startOfDay, toDateKey } from '@/lib/date';

export const HEATMAP_DAYS = 365;
const MS_PER_DAY = 86400000;

export interface HeatmapStats {
  weeks: { days: (number | null)[] }[];
  total: number;
  best: number;
  streak: number;
}

function countClosedByDay(activs: ActivResponse[], todayStart: Date): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of activs) {
    if (!a.end || a.statusId !== STATUS_CLOSED) continue;
    const d = startOfDay(new Date(a.end));
    const diffDays = Math.round((todayStart.getTime() - d.getTime()) / MS_PER_DAY);
    if (diffDays < 0 || diffDays >= HEATMAP_DAYS) continue;
    const key = toDateKey(d);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function heatmapGridStart(todayStart: Date): Date {
  const trailing = monBasedDow(todayStart);
  const gridStart = new Date(todayStart);
  gridStart.setDate(gridStart.getDate() - (HEATMAP_DAYS - 1) - (6 - trailing));
  return gridStart;
}

function buildWeeks(todayStart: Date, counts: Map<string, number>): { days: (number | null)[] }[] {
  const trailing = monBasedDow(todayStart);
  const gridStart = heatmapGridStart(todayStart);
  const totalCells = HEATMAP_DAYS + (6 - trailing);
  const weeks: { days: (number | null)[] }[] = [];

  for (let i = 0; i < totalCells; i += 7) {
    const days: (number | null)[] = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i + j);
      const diffDays = Math.round((todayStart.getTime() - d.getTime()) / MS_PER_DAY);
      days.push(diffDays < 0 || diffDays >= HEATMAP_DAYS ? null : (counts.get(toDateKey(d)) ?? 0));
    }
    weeks.push({ days });
  }
  return weeks;
}

function computeStreak(counts: Map<string, number>, todayStart: Date): number {
  let streak = 0;
  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    if (counts.has(toDateKey(d))) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

export function buildHeatmap(activs: ActivResponse[]): HeatmapStats {
  const todayStart = startOfDay(new Date());
  const counts = countClosedByDay(activs, todayStart);
  const weeks = buildWeeks(todayStart, counts);

  let total = 0;
  let best = 0;
  for (const c of counts.values()) {
    total += c;
    if (c > best) best = c;
  }

  return { weeks, total, best, streak: computeStreak(counts, todayStart) };
}
