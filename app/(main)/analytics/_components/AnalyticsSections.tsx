import {
  Activity, Building2, CalendarCheck, CheckCircle2, Pill, Stethoscope, TrendingUp,
} from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';
import {
  buildByStatus, buildByUsr, buildDailyData, buildSummary, topN,
} from '../_lib/aggregates';
import { useMemo } from 'react';
import { ChartCard } from './ChartCard';
import { SummaryCard } from './SummaryCard';
import { DailyAreaChart } from './DailyAreaChart';
import { StatusPieChart } from './StatusPieChart';
import { TopBarChart } from './TopBarChart';

export function AnalyticsSections({
  activs,
  periodDays,
}: {
  activs: ActivResponse[];
  periodDays: number;
}) {
  const daily = useMemo(() => buildDailyData(activs, periodDays), [activs, periodDays]);
  const topOrgs = useMemo(() => topN(activs, (a) => a.orgName ?? null), [activs]);
  const topPhyses = useMemo(() => topN(activs, (a) => a.physName ?? null), [activs]);
  const topDrugs = useMemo(
    () => topN(activs, (a) => a.drugs.map((d) => d.drugName)),
    [activs],
  );
  const byUsr = useMemo(() => buildByUsr(activs), [activs]);
  const byStatus = useMemo(() => buildByStatus(activs), [activs]);
  const summary = useMemo(() => buildSummary(activs, periodDays), [activs, periodDays]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <SummaryCard
          label="Всего визитов" value={summary.total}
          icon={CalendarCheck} tone="primary"
          hint={`В среднем ${summary.avgPerDay}/день`}
        />
        <SummaryCard
          label="Закрыто" value={`${summary.closed}`}
          icon={CheckCircle2} tone="success"
          hint={`${summary.closedPct}% от всех`}
        />
        <SummaryCard
          label="Организаций" value={summary.uniqueOrgs}
          icon={Building2} tone="warning" hint="уникальных"
        />
        <SummaryCard
          label="Врачей" value={summary.uniquePhyses}
          icon={Stethoscope} tone="default" hint="уникальных"
        />
      </div>

      <ChartCard
        title="Визиты по дням"
        subtitle={`Последние ${periodDays} дн.`}
        icon={Activity} tone="primary"
      >
        <DailyAreaChart data={daily} periodDays={periodDays} />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {byStatus.length > 0 && (
          <ChartCard
            title="По статусам" subtitle="Распределение визитов"
            icon={CheckCircle2} tone="success"
          >
            <StatusPieChart data={byStatus} total={summary.total} />
          </ChartCard>
        )}
        {byUsr.length > 0 && (
          <ChartCard
            title="Активность сотрудников" subtitle="По количеству визитов"
            icon={TrendingUp} tone="primary"
          >
            <TopBarChart data={byUsr} color="var(--primary)" />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {topPhyses.length > 0 && (
          <ChartCard
            title="Топ врачей" subtitle="По количеству визитов"
            icon={Stethoscope} tone="warning"
          >
            <TopBarChart data={topPhyses} color="var(--warning)" yWidth={130} tickLimit={18} height={280} />
          </ChartCard>
        )}
        {topOrgs.length > 0 && (
          <ChartCard
            title="Топ организаций" subtitle="По количеству визитов"
            icon={Building2} tone="success"
          >
            <TopBarChart data={topOrgs} color="var(--success)" yWidth={130} tickLimit={18} height={280} />
          </ChartCard>
        )}
      </div>

      {topDrugs.length > 0 && (
        <ChartCard
          title="Топ препаратов" subtitle="По количеству упоминаний в визитах"
          icon={Pill} tone="default"
        >
          <TopBarChart
            data={topDrugs} color="var(--muted-foreground)"
            yWidth={140} tickLimit={20} height={300} barName="Упоминания"
          />
        </ChartCard>
      )}
    </>
  );
}
