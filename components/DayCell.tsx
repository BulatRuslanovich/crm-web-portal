import type { ActivResponse } from '@/lib/api/types';
import { STATUS_HEX } from '@/lib/api/statuses';
import { fmtHM, monBasedDow } from '@/lib/date';
import type { GridCell } from '@/lib/grid';

const MAX_VISIBLE = 3;
const DEFAULT_COLOR = '#94a3b8';

function cellClass(
  isSelected: boolean,
  isToday: boolean,
  outOfMonth: boolean,
  isWeekend: boolean,
): string {
  if (isSelected) return 'border-primary bg-primary/5 ring-1 ring-primary/30';
  if (isToday) return 'border-primary/40 bg-primary/5';
  if (outOfMonth) return 'border-border/50 bg-card/40 hover:bg-muted/40';
  if (isWeekend) return 'border-border bg-muted/30 hover:bg-muted';
  return 'border-border bg-card hover:bg-muted/60';
}

function dayNumClass(isToday: boolean, outOfMonth: boolean): string {
  if (isToday) return 'bg-primary text-primary-foreground';
  if (outOfMonth) return 'text-muted-foreground/50';
  return 'text-foreground';
}

function EventRow({ activ, outOfMonth }: { activ: ActivResponse; outOfMonth: boolean }) {
  const color = STATUS_HEX[activ.statusName.toLowerCase()] ?? DEFAULT_COLOR;
  const title = activ.physName ?? activ.orgName ?? '—';
  const time = activ.start ? fmtHM(new Date(activ.start)) : '';
  return (
    <div
      className="flex items-center gap-1 overflow-hidden rounded-md px-1.5 py-0.5 text-[10px] leading-tight"
      style={{ background: color + (outOfMonth ? '18' : '25') }}
    >
      <span className="h-3 w-0.5 shrink-0 rounded-full" style={{ background: color }} />
      {time && (
        <span
          className="shrink-0 font-semibold tabular-nums"
          style={{ color: outOfMonth ? undefined : color }}
        >
          {time}
        </span>
      )}
      <span
        className={`truncate font-medium ${
          outOfMonth ? 'text-muted-foreground/60' : 'text-foreground'
        }`}
      >
        {title}
      </span>
    </div>
  );
}

export function DayCell({
  cell,
  activs,
  isToday,
  isSelected,
  onClick,
}: {
  cell: GridCell;
  activs: ActivResponse[];
  isToday: boolean;
  isSelected: boolean;
  onClick: (d: Date) => void;
}) {
  const { date, outOfMonth } = cell;
  const isWeekend = monBasedDow(date) >= 5;
  const items = activs.slice(0, MAX_VISIBLE);
  const overflow = activs.length - MAX_VISIBLE;

  return (
    <button
      onClick={() => onClick(date)}
      className={`group flex min-h-24 w-full cursor-pointer flex-col rounded-xl border p-2 text-left transition-all duration-150 ${cellClass(isSelected, isToday, outOfMonth, isWeekend)}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-colors ${dayNumClass(isToday, outOfMonth)}`}
        >
          {date.getDate()}
        </span>
        {activs.length > 0 && !isToday && (
          <span className="text-muted-foreground/70 text-[10px] font-semibold">
            {activs.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-0.5">
          {items.map((a) => (
            <EventRow key={a.activId} activ={a} outOfMonth={outOfMonth} />
          ))}
          {overflow > 0 && (
            <div className="text-muted-foreground/80 px-1 text-[10px] font-medium">
              +{overflow} ещё
            </div>
          )}
        </div>
      )}
    </button>
  );
}
