import { TrendingUp } from 'lucide-react';
import { ToneIcon } from '@/components/ToneIcon';
import { PERIODS } from '@/lib/chart-style';

function PeriodButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

export function AnalyticsHero({
  periodDays,
  onPeriodChange,
  loading,
  activsCount,
}: {
  periodDays: number;
  onPeriodChange: (days: number) => void;
  loading: boolean;
  activsCount: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-muted to-card shadow-sm">
      <div className="relative flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <ToneIcon icon={TrendingUp} tone="primary" size="lg" />
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Аналитика
            </p>
            <h2 className="text-xl font-bold text-foreground">Динамика визитов</h2>
            {!loading && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activsCount} визитов за последние {periodDays} дн.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <PeriodButton
              key={p.value}
              label={p.label}
              active={periodDays === p.value}
              onClick={() => onPeriodChange(p.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
