import type { ActivResponse } from '@/lib/api/types';
import { buildByStatus, buildByUsr, buildDailyData, buildSummary, topN } from '@/lib/aggregates';
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
  const topDrugs = useMemo(() => topN(activs, (a) => a.drugs.map((d) => d.drugName)), [activs]);
  const byUsr = useMemo(() => buildByUsr(activs), [activs]);
  const byStatus = useMemo(() => buildByStatus(activs), [activs]);
  const summary = useMemo(() => buildSummary(activs, periodDays), [activs, periodDays]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <SummaryCard
          label="Всего визитов"
          value={summary.total}
          hint={`В среднем ${summary.avgPerDay}/день`}
        />
        <SummaryCard
          label="Закрыто"
          value={`${summary.closed}`}
          hint={`${summary.closedPct}% от всех`}
        />
        <SummaryCard label="Организаций" value={summary.uniqueOrgs} hint="уникальных" />
        <SummaryCard label="Врачей" value={summary.uniquePhyses} hint="уникальных" />
      </div>

      <ChartCard title="Визиты по дням" subtitle={`Последние ${periodDays} дн.`}>
        <DailyAreaChart data={daily} periodDays={periodDays} />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {byStatus.length > 0 && (
          <ChartCard title="По статусам" subtitle="Распределение визитов">
            <StatusPieChart data={byStatus} total={summary.total} />
          </ChartCard>
        )}
        {byUsr.length > 0 && (
          <ChartCard title="Активность сотрудников" subtitle="По количеству визитов">
            <TopBarChart data={byUsr} color="var(--primary)" />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {topPhyses.length > 0 && (
          <ChartCard title="Топ врачей" subtitle="По количеству визитов">
            <TopBarChart
              data={topPhyses}
              color="var(--warning)"
              yWidth={130}
              tickLimit={18}
              height={280}
            />
          </ChartCard>
        )}
        {topOrgs.length > 0 && (
          <ChartCard title="Топ организаций" subtitle="По количеству визитов">
            <TopBarChart
              data={topOrgs}
              color="var(--success)"
              yWidth={130}
              tickLimit={18}
              height={280}
            />
          </ChartCard>
        )}
      </div>

      {topDrugs.length > 0 && (
        <ChartCard title="Топ препаратов" subtitle="По количеству упоминаний в визитах">
          <TopBarChart
            data={topDrugs}
            color="var(--muted-foreground)"
            yWidth={140}
            tickLimit={20}
            height={300}
            barName="Упоминания"
          />
        </ChartCard>
      )}
    </>
  );
}
