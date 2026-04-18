import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { pluralizeVisits } from '../../_lib/ru-dates';

export type CalendarView = 'month' | 'week';

function ViewSwitcher({
  view,
  onChange,
}: {
  view: CalendarView;
  onChange: (v: CalendarView) => void;
}) {
  const btnClass = (active: boolean) =>
    `cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`;
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-0.5 shadow-sm">
      <button onClick={() => onChange('month')} className={btnClass(view === 'month')}>
        Месяц
      </button>
      <button onClick={() => onChange('week')} className={btnClass(view === 'week')}>
        Неделя
      </button>
    </div>
  );
}

function RangeNav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const iconBtn =
    'flex h-9 w-9 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button onClick={onPrev} className={iconBtn} aria-label="Назад">
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-48 border-x border-border px-3 py-1.5 text-center text-sm font-semibold text-foreground">
        {label}
      </span>
      <button onClick={onNext} className={iconBtn} aria-label="Вперёд">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function CalendarToolbar({
  view,
  onViewChange,
  rangeLabel,
  onPrev,
  onNext,
  onToday,
  isOnToday,
  loading,
  visibleCount,
}: {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  rangeLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isOnToday: boolean;
  loading: boolean;
  visibleCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
          <CalendarDays size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Календарь</h2>
          {!loading && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{visibleCount}</span>{' '}
              {pluralizeVisits(visibleCount)}{' '}
              {view === 'month' ? 'в этом месяце' : 'на этой неделе'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ViewSwitcher view={view} onChange={onViewChange} />
        <RangeNav label={rangeLabel} onPrev={onPrev} onNext={onNext} />
        <button
          onClick={onToday}
          disabled={isOnToday}
          className="cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Сегодня
        </button>
      </div>
    </div>
  );
}
