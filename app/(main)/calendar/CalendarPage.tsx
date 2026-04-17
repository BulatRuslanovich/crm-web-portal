'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { PageTransition } from '@/components/motion';
import { StatusBadge, Skeleton } from '@/components/ui';
import { STATUS_HEX } from '@/lib/api/statuses';
import { formatShort } from '@/lib/format';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';

/* ── utils ─────────────────────────────────────────────────────────────── */

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const HOUR_HEIGHT = 48;
const TOTAL_HEIGHT = HOUR_HEIGHT * 24;
const DEFAULT_DURATION_MIN = 15;

/** Monday-based day index (0=Mon … 6=Sun) */
function monBasedDow(date: Date) {
  return (date.getDay() + 6) % 7;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Build a flat array of Date|null for the calendar grid */
function buildGrid(year: number, month: number): (Date | null)[] {
  const total = daysInMonth(year, month);
  const firstDow = monBasedDow(new Date(year, month, 1));
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfWeek(d: Date) {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  dt.setDate(dt.getDate() - monBasedDow(dt));
  return dt;
}

function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function fmtTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/* ── event layout (Google/Yandex style) ─────────────────────────────────── */

interface PositionedEvent {
  activ: ActivResponse;
  startMinutes: number;
  endMinutes: number;
  col: number;
  cols: number;
}

function layoutDay(activs: ActivResponse[], day: Date): PositionedEvent[] {
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);

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

    events.push({ activ: a, startMinutes, endMinutes, col: 0, cols: 1 });
  }

  events.sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

  let cluster: PositionedEvent[] = [];
  let clusterEnd = -1;

  function flush() {
    if (!cluster.length) return;
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
    cluster = [];
    clusterEnd = -1;
  }

  for (const ev of events) {
    if (clusterEnd !== -1 && ev.startMinutes >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMinutes);
  }
  flush();

  return events;
}

/* ── day cell (month) ───────────────────────────────────────────────────── */
function DayCell({
  date,
  activs,
  isToday,
  isSelected,
  onClick,
}: {
  date: Date | null;
  activs: ActivResponse[];
  isToday: boolean;
  isSelected: boolean;
  onClick: (d: Date) => void;
}) {
  if (!date) {
    return <div className="min-h-20 rounded-xl border border-(--border)/40 bg-(--surface)/30" />;
  }

  const dots = activs.slice(0, 3);
  const overflow = activs.length - 3;

  return (
    <button
      onClick={() => onClick(date)}
      className={`min-h-20 w-full cursor-pointer rounded-xl border p-2 text-left transition-all duration-150 ${
        isSelected
          ? 'border-(--primary) bg-(--primary-subtle) shadow-sm ring-1 ring-(--primary)/30'
          : isToday
            ? 'border-(--primary)/50 bg-(--primary-subtle)/40'
            : 'border-(--border) bg-(--surface) hover:border-(--primary-border) hover:bg-(--surface-raised)'
      }`}
    >
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
          isToday
            ? 'bg-(--primary) text-(--primary-fg)'
            : isSelected
              ? 'text-(--primary-text)'
              : 'text-(--fg)'
        }`}
      >
        {date.getDate()}
      </span>

      {dots.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {dots.map((a) => (
            <div
              key={a.activId}
              className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight"
              style={{
                background: (STATUS_HEX[a.statusName.toLowerCase()] ?? '#94a3b8') + '30',
                color: STATUS_HEX[a.statusName.toLowerCase()] ?? '#94a3b8',
              }}
            >
              {a.physName ?? a.orgName ?? '—'}
            </div>
          ))}
          {overflow > 0 && (
            <div className="px-1 text-[10px] text-(--fg-muted)">+{overflow} ещё</div>
          )}
        </div>
      )}
    </button>
  );
}

/* ── week view ──────────────────────────────────────────────────────────── */

function WeekView({
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
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = HOUR_HEIGHT * 7;
    }
  }, []);

  const todayInWeek = days.some((d) => isSameDay(d, today));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div
      className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Day headers */}
      <div
        className="grid border-b border-(--border)"
        style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
      >
        <div />
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div
              key={toDateKey(d)}
              className="border-l border-(--border) px-2 py-2 text-center"
            >
              <div className="text-[10px] font-semibold uppercase text-(--fg-muted)">
                {WEEKDAYS[monBasedDow(d)]}
              </div>
              <div
                className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  isToday
                    ? 'bg-(--primary) text-(--primary-fg)'
                    : 'text-(--fg)'
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="relative max-h-[640px] overflow-y-auto">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
        >
          {/* Time labels */}
          <div
            className="relative border-r border-(--border)"
            style={{ height: TOTAL_HEIGHT }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[10px] text-(--fg-muted)"
                style={{ top: h * HOUR_HEIGHT }}
              >
                {h > 0 ? `${h.toString().padStart(2, '0')}:00` : ''}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const activs = activsByDay.get(toDateKey(d)) ?? [];
            const events = layoutDay(activs, d);
            const isToday = isSameDay(d, today);
            return (
              <div
                key={toDateKey(d)}
                className="relative border-l border-(--border)"
                style={{ height: TOTAL_HEIGHT }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="pointer-events-none absolute right-0 left-0 border-t border-(--border)/40"
                    style={{ top: h * HOUR_HEIGHT }}
                  />
                ))}

                {isToday && todayInWeek && (
                  <div
                    className="pointer-events-none absolute right-0 left-0 z-20"
                    style={{ top: (nowMinutes / 60) * HOUR_HEIGHT }}
                  >
                    <div className="relative h-px bg-red-500">
                      <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                    </div>
                  </div>
                )}

                {events.map((ev) => {
                  const top = (ev.startMinutes / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    ((ev.endMinutes - ev.startMinutes) / 60) * HOUR_HEIGHT,
                    18,
                  );
                  const widthPct = 100 / ev.cols;
                  const leftPct = ev.col * widthPct;
                  const color =
                    STATUS_HEX[ev.activ.statusName.toLowerCase()] ?? '#94a3b8';
                  const title = ev.activ.physName ?? ev.activ.orgName ?? '—';
                  return (
                    <Link
                      key={ev.activ.activId}
                      href={`/activs/${ev.activ.activId}`}
                      className="absolute z-10 overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-[10px] leading-tight transition-shadow hover:z-30 hover:shadow-md"
                      style={{
                        top,
                        height,
                        left: `calc(${leftPct}% + 1px)`,
                        width: `calc(${widthPct}% - 3px)`,
                        background: color + '25',
                        borderLeftColor: color,
                      }}
                      title={`${title} · ${fmtTime(ev.startMinutes)}–${fmtTime(ev.endMinutes)}`}
                    >
                      <div className="truncate font-semibold text-(--fg)">
                        {title}
                      </div>
                      {height >= 28 && (
                        <div
                          className="truncate text-[9px]"
                          style={{ color }}
                        >
                          {fmtTime(ev.startMinutes)}–{fmtTime(ev.endMinutes)}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── selected day panel ─────────────────────────────────────────────────── */
function DayPanel({
  date,
  activs,
  onClose,
}: {
  date: Date;
  activs: ActivResponse[];
  onClose: () => void;
}) {
  const label = `${date.getDate()} ${MONTHS[date.getMonth()].toLowerCase()} ${date.getFullYear()}`;

  return (
    <div
      className="animate-fade-in overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
      style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
    >
      <div className="flex items-center justify-between border-b border-(--border) px-5 py-3.5">
        <h3 className="text-sm font-bold text-(--fg)">{label}</h3>
        <div className="flex items-center gap-2">
          {activs.length > 0 && (
            <span className="text-xs text-(--fg-muted)">{activs.length} визит(ов)</span>
          )}
          <Link
            href={`/activs/create`}
            className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--fg-muted) transition-all hover:border-(--primary-border) hover:text-(--primary-text)"
          >
            <Plus size={11} />
            Визит
          </Link>
          <button
            onClick={onClose}
            className="cursor-pointer text-xs text-(--fg-subtle) transition-colors hover:text-(--fg)"
          >
            ✕
          </button>
        </div>
      </div>

      {activs.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-(--fg-muted)">Нет визитов на этот день</p>
        </div>
      ) : (
        <div className="divide-y divide-(--border)">
          {activs.map((a) => (
            <Link
              key={a.activId}
              href={`/activs/${a.activId}`}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-(--surface-raised)"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-(--fg)">
                  {a.physName ?? a.orgName ?? '—'}
                </p>
                <p className="mt-0.5 text-xs text-(--fg-muted)">
                  {formatShort(a.start)} · {a.usrLogin}
                </p>
                {a.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-(--fg-subtle)">{a.description}</p>
                )}
              </div>
              <StatusBadge name={a.statusName} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main ───────────────────────────────────────────────────────────────── */

export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [anchor, setAnchor] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);

  const { data: activs, loading } = useApi(
    [
      'calendar-activs',
      view,
      view === 'month' ? `${year}-${month}` : toDateKey(weekStart),
    ],
    () => {
      const [from, to] =
        view === 'month'
          ? [
              new Date(year, month, 1),
              new Date(year, month + 1, 0, 23, 59, 59),
            ]
          : [weekStart, addDays(weekStart, 6)];
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      return activsApi
        .getAll(1, 500, undefined, 'start', false, undefined, from.toISOString(), toEnd.toISOString())
        .then((r) => r.data.items);
    },
    { keepPreviousData: true },
  );

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const activsByDay = useMemo(() => {
    const map = new Map<string, ActivResponse[]>();
    if (!activs) return map;
    for (const a of activs) {
      if (!a.start) continue;
      const d = new Date(a.start);
      const key = toDateKey(d);
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [activs]);

  const selectedActivs = useMemo(() => {
    if (!selectedDate) return [];
    return activsByDay.get(toDateKey(selectedDate)) ?? [];
  }, [selectedDate, activsByDay]);

  function shiftPrev() {
    if (view === 'month') {
      setAnchor(new Date(year, month - 1, 1));
    } else {
      setAnchor(addDays(weekStart, -7));
    }
    setSelectedDate(null);
  }

  function shiftNext() {
    if (view === 'month') {
      setAnchor(new Date(year, month + 1, 1));
    } else {
      setAnchor(addDays(weekStart, 7));
    }
    setSelectedDate(null);
  }

  function goToToday() {
    setAnchor(today);
    if (view === 'month') setSelectedDate(today);
  }

  const monthCount = useMemo(() => {
    let cnt = 0;
    if (view === 'month') {
      activsByDay.forEach((arr) => {
        const sample = arr[0];
        if (sample?.start) {
          const d = new Date(sample.start);
          if (d.getFullYear() === year && d.getMonth() === month) cnt += arr.length;
        }
      });
    } else {
      for (let i = 0; i < 7; i++) {
        const arr = activsByDay.get(toDateKey(addDays(weekStart, i)));
        if (arr) cnt += arr.length;
      }
    }
    return cnt;
  }, [activsByDay, view, year, month, weekStart]);

  const rangeLabel = useMemo(() => {
    if (view === 'month') return `${MONTHS[month]} ${year}`;
    const end = addDays(weekStart, 6);
    if (weekStart.getMonth() === end.getMonth()) {
      return `${weekStart.getDate()}–${end.getDate()} ${MONTHS[weekStart.getMonth()].toLowerCase()} ${end.getFullYear()}`;
    }
    return `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].toLowerCase()} – ${end.getDate()} ${MONTHS[end.getMonth()].toLowerCase()} ${end.getFullYear()}`;
  }, [view, year, month, weekStart]);

  return (
    <PageTransition className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-subtle)">
            <CalendarDays size={18} className="text-(--primary-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Календарь</h2>
            {!loading && (
              <p className="text-xs text-(--fg-muted)">
                {monthCount} визит(ов) {view === 'month' ? 'в этом месяце' : 'на этой неделе'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="inline-flex rounded-xl border border-(--border) bg-(--surface) p-0.5">
            <button
              onClick={() => setView('month')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                view === 'month'
                  ? 'bg-(--primary-subtle) text-(--primary-text)'
                  : 'text-(--fg-muted) hover:text-(--fg)'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setView('week')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                view === 'week'
                  ? 'bg-(--primary-subtle) text-(--primary-text)'
                  : 'text-(--fg-muted) hover:text-(--fg)'
              }`}
            >
              Неделя
            </button>
          </div>

          <button
            onClick={goToToday}
            className="cursor-pointer rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-xs font-medium text-(--fg-muted) transition-all hover:border-(--primary-border) hover:text-(--fg)"
          >
            Сегодня
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={shiftPrev}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--fg-muted) transition-all hover:bg-(--surface-raised) hover:text-(--fg)"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-52 text-center text-sm font-semibold text-(--fg)">
              {rangeLabel}
            </span>
            <button
              onClick={shiftNext}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--fg-muted) transition-all hover:bg-(--surface-raised) hover:text-(--fg)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {view === 'month' ? (
        <div
          className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="grid grid-cols-7 border-b border-(--border)">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-xs font-semibold text-(--fg-muted)"
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-1 p-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="min-h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 p-2">
              {grid.map((date, i) => (
                <DayCell
                  key={i}
                  date={date}
                  activs={date ? (activsByDay.get(toDateKey(date)) ?? []) : []}
                  isToday={date ? isSameDay(date, today) : false}
                  isSelected={date && selectedDate ? isSameDay(date, selectedDate) : false}
                  onClick={(d) =>
                    setSelectedDate((prev) =>
                      prev && isSameDay(prev, d) ? null : d,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <Skeleton className="h-[640px] rounded-2xl" />
      ) : (
        <WeekView
          weekStart={weekStart}
          activsByDay={activsByDay}
          today={today}
          now={today}
        />
      )}

      {/* Selected day panel (month view only) */}
      {view === 'month' && selectedDate && (
        <DayPanel
          date={selectedDate}
          activs={selectedActivs}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </PageTransition>
  );
}
