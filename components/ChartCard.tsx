import React from 'react';

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-2xl border">
      <div className="flex items-start gap-3 px-5 pt-5 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground text-[13px] font-medium tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 text-[11px] tabular-nums">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="px-5 pt-2 pb-5">{children}</div>
    </div>
  );
}
