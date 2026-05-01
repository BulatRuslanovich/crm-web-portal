import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_TICK, AXIS_TICK_SMALL, CHART_TOOLTIP, truncateTick,
} from '@/lib/chart-style';

interface BarDatum {
  name: string;
  count: number;
}

export function TopBarChart({
  data,
  color,
  barName = 'Визиты',
  yWidth = 100,
  tickLimit,
  height = 220,
}: {
  data: BarDatum[];
  color: string;
  barName?: string;
  yWidth?: number;
  tickLimit?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={yWidth}
          tick={tickLimit ? AXIS_TICK_SMALL : AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickFormatter={tickLimit ? truncateTick(tickLimit) : undefined}
        />
        <Tooltip {...CHART_TOOLTIP} />
        <Bar
          dataKey="count"
          name={barName}
          fill={color}
          radius={[0, 4, 4, 0]}
          maxBarSize={tickLimit ? 18 : 20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
