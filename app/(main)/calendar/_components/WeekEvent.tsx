import Link from 'next/link';
import { STATUS_HEX } from '@/lib/api/statuses';
import { fmtMinutes } from '../../_lib/date';
import { HOUR_HEIGHT } from '../_lib/constants';
import type { PositionedEvent } from '../_lib/layout';

const DEFAULT_COLOR = '#94a3b8';
const TIMESTAMP_MIN_HEIGHT = 32;

export function WeekEvent({ ev }: { ev: PositionedEvent }) {
  const top = (ev.startMinutes / 60) * HOUR_HEIGHT;
  const height = ((ev.endMinutes - ev.startMinutes) / 60) * HOUR_HEIGHT;
  const widthPct = 100 / ev.cols;
  const leftPct = ev.col * widthPct;
  const color = STATUS_HEX[ev.activ.statusName.toLowerCase()] ?? DEFAULT_COLOR;
  const title = ev.activ.physName ?? ev.activ.orgName ?? '—';
  const timeRange = `${fmtMinutes(ev.startMinutes)}–${fmtMinutes(ev.endMinutes)}`;

  return (
    <Link
      href={`/activs/${ev.activ.activId}`}
      className="absolute z-10 flex flex-col overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-[10px] leading-tight shadow-sm transition-all duration-150 hover:z-30 hover:shadow-md hover:brightness-105"
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        background: color + '28',
        borderLeftColor: color,
      }}
      title={`${title} · ${timeRange}`}
    >
      <div className="truncate font-semibold text-foreground">{title}</div>
      {height >= TIMESTAMP_MIN_HEIGHT && (
        <div className="truncate font-mono text-[9px] tabular-nums opacity-85" style={{ color }}>
          {timeRange}
        </div>
      )}
    </Link>
  );
}
