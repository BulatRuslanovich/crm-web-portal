export function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-5">
      <p className="text-foreground text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
      {hint && <p className="text-muted-foreground/70 mt-1 text-[10px]">{hint}</p>}
    </div>
  );
}
