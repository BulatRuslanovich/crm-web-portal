import { ToneIcon } from '../../_components/ToneIcon';
import type { Tone } from '../../_lib/tone';

export function ChartCard({
  title,
  subtitle,
  icon,
  tone = 'default',
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-border px-5 py-4">
        {icon && <ToneIcon icon={icon} tone={tone} size="sm" />}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
