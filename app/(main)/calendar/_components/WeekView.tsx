import { useEffect, useMemo, useRef } from 'react';
import { Clock } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import { addDays, isSameDay, monBasedDow, toDateKey } from '../../_lib/date';
import { WEEKDAYS_SHORT } from '../../_lib/ru-dates';
import { HOUR_HEIGHT, TOTAL_HEIGHT } from '../_lib/constants';
import { layoutDay } from '../_lib/layout';
import { WeekEvent } from './WeekEvent';

const SCROLL_TOP_HOUR = 7;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function DayHeader({ date, today }: { date: Date; today: Date }) {
  const isToday = isSameDay(date, today);
  const isWeekend = monBasedDow(date) >= 5;
  return (
    <div
      className={`border-l border-border px-2 py-2.5 text-center ${
        isWeekend && !isToday ? 'bg-muted/20' : ''
      }`}
    >
      <div
        className={`text-[10px] font-bold tracking-wider uppercase ${
          isToday ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {WEEKDAYS_SHORT[monBasedDow(date)]}
      </div>
      <div
        className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-colors ${
          isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground'
        }`}
      >
        {date.getDate()}
      </div>
    </div>
  );
}

function NowMarker({ nowMinutes }: { nowMinutes: number }) {
  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}
    >
      <div className="relative h-0.5 bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]">
        <div className="absolute -top-[5px] -left-[5px] h-3 w-3 rounded-full bg-destructive ring-2 ring-card" />
      </div>
    </div>
  );
}

function DayColumn({
  date,
  activs,
  today,
  nowMinutes,
}: {
  date: Date;
  activs: ActivResponse[];
  today: Date;
  nowMinutes: number;
}) {
  const events = layoutDay(activs, date);
  const isToday = isSameDay(date, today);
  const isWeekend = monBasedDow(date) >= 5;
  return (
    <div
      className={`relative border-l border-border ${isWeekend ? 'bg-muted/20' : ''} ${
        isToday ? 'bg-primary/[0.03]' : ''
      }`}
      style={{ height: TOTAL_HEIGHT }}
    >
      {HOURS.map((h) => (
        <div
          key={h}
          className={`pointer-events-none absolute right-0 left-0 ${
            h % 6 === 0 && h !== 0 ? 'border-t border-border/60' : 'border-t border-border/30'
          }`}
          style={{ top: h * HOUR_HEIGHT }}
        />
      ))}
      {isToday && <NowMarker nowMinutes={nowMinutes} />}
      {events.map((ev) => (
        <WeekEvent key={ev.activ.activId} ev={ev} />
      ))}
    </div>
  );
}

export function WeekView({
  weekStart,
  activsByDay,
  today,
  now,
}: {
  weekStart: Date;
  activsByDay: Map<string, ActivResponse[]>;
  today: Date;
  now: Date;
}) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = HOUR_HEIGHT * SCROLL_TOP_HOUR;
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className="sticky top-0 z-20 grid border-b border-border bg-card/95 backdrop-blur"
        style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
      >
        <div className="flex items-center justify-center">
          <Clock size={12} className="text-muted-foreground/60" />
        </div>
        {days.map((d) => (
          <DayHeader key={toDateKey(d)} date={d} today={today} />
        ))}
      </div>

      <div ref={scrollRef} className="relative max-h-[640px] overflow-y-auto">
        <div className="relative grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="relative border-r border-border bg-card" style={{ height: TOTAL_HEIGHT }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground/80 tabular-nums"
                style={{ top: h * HOUR_HEIGHT }}
              >
                {h > 0 ? `${h.toString().padStart(2, '0')}:00` : ''}
              </div>
            ))}
          </div>
          {days.map((d) => (
            <DayColumn
              key={toDateKey(d)}
              date={d}
              activs={activsByDay.get(toDateKey(d)) ?? []}
              today={today}
              nowMinutes={nowMinutes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
