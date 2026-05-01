import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { STATUS_HEX } from '@/lib/api/statuses';
import { CHART_TOOLTIP } from '@/lib/chart-style';

const DEFAULT_COLOR = '#94a3b8';

interface StatusSlice {
  name: string;
  value: number;
}

function LegendRow({
  slice,
  color,
  total,
}: {
  slice: StatusSlice;
  color: string;
  total: number;
}) {
  const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="truncate text-muted-foreground">{slice.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 tabular-nums">
        <span className="text-[10px] text-muted-foreground/70">{pct}%</span>
        <span className="font-bold text-foreground">{slice.value}</span>
      </div>
    </div>
  );
}

export function StatusPieChart({ data, total }: { data: StatusSlice[]; total: number }) {
  const colors = data.map((d) => STATUS_HEX[d.name.toLowerCase()] ?? DEFAULT_COLOR);

  return (
    <div className="flex items-center gap-6">
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={70} outerRadius={92}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip {...CHART_TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((slice, i) => (
          <LegendRow key={slice.name} slice={slice} color={colors[i]} total={total} />
        ))}
      </div>
    </div>
  );
}
