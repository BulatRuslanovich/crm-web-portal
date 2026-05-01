import { useMemo } from 'react';
import { startOfDay } from '@/lib/date';
import { MONTHS_ABBR, WEEKDAYS_SHORT } from '@/lib/ru-dates';
import { heatmapGridStart, type HeatmapStats } from '@/lib/heatmap';
import { HeatmapCell } from './HeatmapCell';

function WeekdayLabels() {
  return (
    <div
      className="grid w-6 shrink-0 gap-[3px] pt-[18px]"
      style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
    >
      {WEEKDAYS_SHORT.map((d, i) => (
        <div
          key={d}
          className={`flex items-center text-[10px] text-muted-foreground ${
            i % 2 === 1 ? '' : 'invisible'
          }`}
        >
          {d}
        </div>
      ))}
    </div>
  );
}

function computeMonthLabels(weekCount: number): { weekIdx: number; label: string }[] {
  const labels: { weekIdx: number; label: string }[] = [];
  const gridStart = heatmapGridStart(startOfDay(new Date()));
  let lastMonth = -1;

  for (let wIdx = 0; wIdx < weekCount; wIdx++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + wIdx * 7);
    if (d.getMonth() !== lastMonth) {
      labels.push({ weekIdx: wIdx, label: MONTHS_ABBR[d.getMonth()] });
      lastMonth = d.getMonth();
    }
  }
  return labels;
}

function MonthLabels({ weekCount }: { weekCount: number }) {
  const monthLabels = useMemo(() => computeMonthLabels(weekCount), [weekCount]);
  return (
    <div
      className="mb-1 grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: weekCount }).map((_, wIdx) => {
        const label = monthLabels.find((m) => m.weekIdx === wIdx);
        return (
          <div key={wIdx} className="h-3 text-[10px] font-medium text-muted-foreground">
            {label?.label ?? ''}
          </div>
        );
      })}
    </div>
  );
}

function dateFor(wIdx: number, dIdx: number): Date {
  const gridStart = heatmapGridStart(startOfDay(new Date()));
  const d = new Date(gridStart);
  d.setDate(d.getDate() + wIdx * 7 + dIdx);
  return d;
}

function WeeksGrid({ stats }: { stats: HeatmapStats }) {
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${stats.weeks.length}, minmax(0, 1fr))` }}
    >
      {stats.weeks.map((w, wIdx) => (
        <div
          key={wIdx}
          className="grid gap-[3px]"
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
        >
          {w.days.map((c, dIdx) => (
            <HeatmapCell
              key={dIdx}
              count={c}
              max={stats.best}
              date={c !== null ? dateFor(wIdx, dIdx) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
      <span>меньше</span>
      <div className="h-2.5 w-2.5 rounded-sm bg-muted ring-1 ring-border/50" />
      <div className="h-2.5 w-2.5 rounded-sm bg-success/30 ring-1 ring-border/50" />
      <div className="h-2.5 w-2.5 rounded-sm bg-success/55 ring-1 ring-border/50" />
      <div className="h-2.5 w-2.5 rounded-sm bg-success/80 ring-1 ring-border/50" />
      <div className="h-2.5 w-2.5 rounded-sm bg-success ring-1 ring-border/50" />
      <span>больше</span>
    </div>
  );
}

export function HeatmapGrid({ stats }: { stats: HeatmapStats }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <WeekdayLabels />
        <div className="min-w-0 flex-1">
          <MonthLabels weekCount={stats.weeks.length} />
          <WeeksGrid stats={stats} />
        </div>
      </div>
      <Legend />
    </div>
  );
}
