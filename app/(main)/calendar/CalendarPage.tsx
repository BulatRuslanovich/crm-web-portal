'use client';

import { useMemo, useState } from 'react';
import type { ActivResponse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/use-roles';
import { useUserFilter } from '@/lib/use-user-filter';
import { usePickerUsers } from '@/lib/use-picker-users';
import { PageTransition } from '@/components/motion';
import { Skeleton } from '@/components/ui';
import { UserFilter } from '@/components/UserFilter';
import {
  addDays,
  isSameDay,
  startOfWeek,
  toDateKey,
} from '../_lib/date';
import { MONTHS_NOM } from '../_lib/ru-dates';
import { buildGrid } from './_lib/grid';
import { useCalendarData } from './_lib/use-calendar-data';
import {
  CalendarToolbar,
  type CalendarView,
} from './_components/CalendarToolbar';
import { MonthGrid } from './_components/MonthGrid';
import { WeekView } from './_components/WeekView';
import { DayPanel } from './_components/DayPanel';

function buildRangeLabel(view: CalendarView, year: number, month: number, weekStart: Date): string {
  if (view === 'month') return `${MONTHS_NOM[month]} ${year}`;

  const end = addDays(weekStart, 6);
  if (weekStart.getMonth() === end.getMonth()) {
    return `${weekStart.getDate()}–${end.getDate()} ${MONTHS_NOM[weekStart.getMonth()].toLowerCase()} ${end.getFullYear()}`;
  }
  return `${weekStart.getDate()} ${MONTHS_NOM[weekStart.getMonth()].toLowerCase()} – ${end.getDate()} ${MONTHS_NOM[end.getMonth()].toLowerCase()} ${end.getFullYear()}`;
}

function countVisible(
  view: CalendarView,
  activsByDay: Map<string, ActivResponse[]>,
  grid: { date: Date; outOfMonth: boolean }[],
  weekStart: Date,
): number {
  let cnt = 0;
  if (view === 'month') {
    for (const cell of grid) {
      if (cell.outOfMonth) continue;
      cnt += (activsByDay.get(toDateKey(cell.date)) ?? []).length;
    }
  } else {
    for (let i = 0; i < 7; i++) {
      cnt += (activsByDay.get(toDateKey(addDays(weekStart, i))) ?? []).length;
    }
  }
  return cnt;
}

export default function CalendarPage() {
  const today = new Date();
  const { user } = useAuth();
  const { isAdmin, isDirector, isManager } = useRoles();
  const canFilterByUser = isAdmin || isDirector || isManager;

  const [view, setView] = useState<CalendarView>('month');
  const [anchor, setAnchor] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterUsrId, setFilterUsrId] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canFilterByUser);
  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);

  const { activsByDay, loading } = useCalendarData({
    view,
    year,
    month,
    weekStart,
    usrId: usrIdParam,
  });

  const grid = useMemo(() => buildGrid(year, month), [year, month]);
  const selectedActivs = useMemo(
    () => (selectedDate ? (activsByDay.get(toDateKey(selectedDate)) ?? []) : []),
    [selectedDate, activsByDay],
  );

  const visibleCount = useMemo(
    () => countVisible(view, activsByDay, grid, weekStart),
    [view, activsByDay, grid, weekStart],
  );

  const rangeLabel = useMemo(
    () => buildRangeLabel(view, year, month, weekStart),
    [view, year, month, weekStart],
  );

  const isOnToday =
    view === 'month'
      ? year === today.getFullYear() && month === today.getMonth()
      : isSameDay(weekStart, startOfWeek(today));

  function shiftPrev() {
    setAnchor(view === 'month' ? new Date(year, month - 1, 1) : addDays(weekStart, -7));
    setSelectedDate(null);
  }

  function shiftNext() {
    setAnchor(view === 'month' ? new Date(year, month + 1, 1) : addDays(weekStart, 7));
    setSelectedDate(null);
  }

  function goToToday() {
    setAnchor(today);
    if (view === 'month') setSelectedDate(today);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate((prev) => (prev && isSameDay(prev, date) ? null : date));
  }

  return (
    <PageTransition className="space-y-4">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        rangeLabel={rangeLabel}
        onPrev={shiftPrev}
        onNext={shiftNext}
        onToday={goToToday}
        isOnToday={isOnToday}
        loading={loading}
        visibleCount={visibleCount}
      />

      {canFilterByUser && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      {view === 'month' ? (
        <MonthGrid
          grid={grid}
          activsByDay={activsByDay}
          today={today}
          selectedDate={selectedDate}
          onSelect={handleSelectDate}
          loading={loading}
        />
      ) : loading ? (
        <Skeleton className="h-[640px] rounded-2xl" />
      ) : (
        <WeekView weekStart={weekStart} activsByDay={activsByDay} today={today} now={today} />
      )}

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
