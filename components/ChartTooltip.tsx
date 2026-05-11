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
    <div className="border-border bg-card/95 animate-fade-in min-w-[140px] rounded-lg border px-3 py-2 backdrop-blur-sm">
      {label !== undefined && label !== '' && (
        <p className="text-muted-foreground/70 mb-1.5 text-[10px] font-medium tracking-[0.12em] uppercase">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[12px]">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: p.color ?? p.payload?.fill }}
            />
            <span className="text-muted-foreground flex-1">{p.name}</span>
            <span className="text-foreground font-medium tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
