interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
  payload?: { fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border-border bg-card/95 animate-fade-in min-w-[140px] rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm">
      {label !== undefined && label !== '' && (
        <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wider uppercase">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: p.color ?? p.payload?.fill }}
            />
            <span className="text-muted-foreground flex-1">{p.name}</span>
            <span className="text-foreground font-bold tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
