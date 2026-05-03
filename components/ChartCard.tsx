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
    <div className="border-border bg-card rounded-2xl border shadow-sm">
      <div className="border-border flex items-start gap-3 border-b px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-foreground text-sm font-bold">{title}</h3>
          {subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
