import type { ActivResponse } from '@/lib/api/types';
import { isSameDay } from '../../_lib/date';
import { DEFAULT_DURATION_MIN, MIN_EVENT_MINUTES } from './constants';

export interface PositionedEvent {
  activ: ActivResponse;
  startMinutes: number;
  endMinutes: number;
  col: number;
  cols: number;
}

function buildEvents(activs: ActivResponse[], day: Date): PositionedEvent[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

  const events: PositionedEvent[] = [];
  for (const a of activs) {
    if (!a.start) continue;
    const start = new Date(a.start);
    if (!isSameDay(start, day)) continue;

    const endRaw = a.end
      ? new Date(a.end)
      : new Date(start.getTime() + DEFAULT_DURATION_MIN * 60 * 1000);
    const end = endRaw > dayEnd ? dayEnd : endRaw;

    const startMinutes = (start.getTime() - dayStart.getTime()) / 60000;
    let endMinutes = (end.getTime() - dayStart.getTime()) / 60000;
    if (endMinutes <= startMinutes) endMinutes = startMinutes + DEFAULT_DURATION_MIN;
    if (endMinutes - startMinutes < MIN_EVENT_MINUTES) {
      endMinutes = startMinutes + MIN_EVENT_MINUTES;
    }

    events.push({ activ: a, startMinutes, endMinutes, col: 0, cols: 1 });
  }

  events.sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
  return events;
}

function assignColumns(cluster: PositionedEvent[]): void {
  const columns: PositionedEvent[][] = [];
  for (const ev of cluster) {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (col[col.length - 1].endMinutes <= ev.startMinutes) {
        col.push(ev);
        ev.col = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      ev.col = columns.length;
      columns.push([ev]);
    }
  }
  const total = columns.length;
  for (const ev of cluster) ev.cols = total;
}

export function layoutDay(activs: ActivResponse[], day: Date): PositionedEvent[] {
  const events = buildEvents(activs, day);

  let cluster: PositionedEvent[] = [];
  let clusterEnd = -1;

  for (const ev of events) {
    if (clusterEnd !== -1 && ev.startMinutes >= clusterEnd) {
      assignColumns(cluster);
      cluster = [];
      clusterEnd = -1;
    }
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMinutes);
  }
  if (cluster.length) assignColumns(cluster);

  return events;
}
