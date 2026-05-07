import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_TICK, CHART_GRID } from '@/lib/chart-style';
import { ChartTooltip } from './ChartTooltip';
import type { DailyPoint } from '@/lib/aggregates';

function intervalFor(periodDays: number): number {
  if (periodDays >= 365) return 30;
  if (periodDays >= 90) return 14;
  return 4;
}

export function DailyAreaChart({ data, periodDays }: { data: DailyPoint[]; periodDays: number }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 16 }}>
        <defs>
          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="closedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...CHART_GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          interval={intervalFor(periodDays)}
          angle={-45}
          textAnchor="end"
          height={40}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="count"
          name="Всего"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#totalGrad)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
        />
        <Area
          type="monotone"
          dataKey="closed"
          name="Закрыто"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#closedGrad)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
