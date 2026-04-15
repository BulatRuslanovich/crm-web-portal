'use client';

import { useState, useMemo } from 'react';
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

  // pad to full weeks
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

/* ── day cell ───────────────────────────────────────────────────────────── */
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
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch activs only for the visible month range
  const { data: activs, loading } = useApi(
    ['calendar-activs', year, month],
    () => {
      const from = new Date(year, month, 1).toISOString();
      const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      return activsApi
        .getAll(1, 500, undefined, 'start', false, undefined, from, to)
        .then((r) => r.data.items);
    },
    { keepPreviousData: true },
  );

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  // Map: day key → activs for that day
  const activsByDay = useMemo(() => {
    const map = new Map<string, ActivResponse[]>();
    if (!activs) return map;
    for (const a of activs) {
      if (!a.start) continue;
      const d = new Date(a.start);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = toDateKey(d);
        const arr = map.get(key) ?? [];
        arr.push(a);
        map.set(key, arr);
      }
    }
    return map;
  }, [activs, year, month]);

  const selectedActivs = useMemo(() => {
    if (!selectedDate) return [];
    return activsByDay.get(toDateKey(selectedDate)) ?? [];
  }, [selectedDate, activsByDay]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(today);
  }

  // Total activs count for this month
  const monthCount = useMemo(() => {
    let cnt = 0;
    activsByDay.forEach((v) => cnt += v.length);
    return cnt;
  }, [activsByDay]);

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
              <p className="text-xs text-(--fg-muted)">{monthCount} визит(ов) в этом месяце</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="cursor-pointer rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-xs font-medium text-(--fg-muted) transition-all hover:border-(--primary-border) hover:text-(--fg)"
          >
            Сегодня
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--fg-muted) transition-all hover:bg-(--surface-raised) hover:text-(--fg)"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-40 text-center text-sm font-semibold text-(--fg)">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--fg-muted) transition-all hover:bg-(--surface-raised) hover:text-(--fg)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {/* Weekday headers */}
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

        {/* Day cells */}
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

      {/* Selected day panel */}
      {selectedDate && (
        <DayPanel
          date={selectedDate}
          activs={selectedActivs}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </PageTransition>
  );
}
