import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconTone = 'primary' | 'success' | 'warning';

const TONE_ICON_BG: Record<IconTone, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/20',
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
};

const TONE_ACCENT: Record<IconTone, string> = {
  primary: 'from-primary/10 via-primary/5',
  success: 'from-success/10 via-success/5',
  warning: 'from-warning/10 via-warning/5',
};

interface AuthFormShellProps {
  title: string;
  subtitle: React.ReactNode;
  icon: LucideIcon;
  iconTone?: IconTone;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthFormShell({
  title,
  subtitle,
  icon: Icon,
  iconTone = 'primary',
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <div>
      {/* accent header */}
      <div className={cn(
        'relative overflow-hidden rounded-t-xl border-b border-border px-6 pb-5 pt-6',
        'bg-gradient-to-br to-transparent',
        TONE_ACCENT[iconTone],
      )}>
        <div className={cn(
          'mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1',
          TONE_ICON_BG[iconTone],
        )}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* form body */}
      <div className="px-6 py-5">{children}</div>

      {/* footer */}
      {footer && (
        <div className="rounded-b-xl border-t border-border bg-muted/30 px-6 py-4">
          <div className="flex flex-col gap-1.5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
