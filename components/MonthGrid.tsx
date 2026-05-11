import type { ActivResponse } from '@/lib/api/types';
import { Skeleton } from '@/components/ui';
import { isSameDay, toDateKey } from '@/lib/date';
import { WEEKDAYS_SHORT } from '@/lib/ru-dates';
import type { GridCell } from '@/lib/grid';
import { DayCell } from './DayCell';

const GRID_CELLS = 42;

export function MonthGrid({
  grid,
  activsByDay,
  today,
  selectedDate,
  onSelect,
  loading,
}: {
  grid: GridCell[];
  activsByDay: Map<string, ActivResponse[]>;
  today: Date;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  loading: boolean;
}) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border bg-muted/30 grid grid-cols-7 border-b">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className={`py-2.5 text-center text-[11px] font-bold tracking-wider uppercase ${
              i >= 5 ? 'text-muted-foreground/70' : 'text-muted-foreground'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1 p-2">
          {Array.from({ length: GRID_CELLS }).map((_, i) => (
            <Skeleton key={i} className="min-h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 p-2">
          {grid.map((cell, i) => (
            <DayCell
              key={i}
              cell={cell}
              activs={activsByDay.get(toDateKey(cell.date)) ?? []}
              isToday={isSameDay(cell.date, today)}
              isSelected={selectedDate ? isSameDay(cell.date, selectedDate) : false}
              onClick={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
