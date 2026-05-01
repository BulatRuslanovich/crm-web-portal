import { CalendarCheck, CheckCircle2, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import { StatPill } from './StatPill';

const PREVIEW_LIMIT = 50;

export interface ReportStats {
  total: number;
  closed: number;
  closedPct: number;
  uniqueUsers: number;
}

export function StatPills({ stats, filteredCount }: { stats: ReportStats; filteredCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatPill label="Всего" value={stats.total} icon={CalendarCheck} tone="primary" />
      <StatPill
        label={`Закрыто · ${stats.closedPct}%`}
        value={stats.closed}
        icon={CheckCircle2}
        tone="success"
      />
      <StatPill
        label="Сотрудников"
        value={stats.uniqueUsers}
        icon={SlidersHorizontal}
        tone="warning"
      />
      <StatPill
        label="В выгрузке"
        value={Math.min(filteredCount, PREVIEW_LIMIT)}
        icon={FileSpreadsheet}
        tone="default"
      />
    </div>
  );
}
