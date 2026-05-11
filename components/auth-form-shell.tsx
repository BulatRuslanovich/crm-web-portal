import type { LucideIcon } from 'lucide-react';
import React from 'react';

type IconTone = 'primary' | 'success' | 'warning';

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
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <div>
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-foreground text-[18px] font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1 text-[13px]">{subtitle}</p>
      </div>

      <div className="px-7 pt-4 pb-6">{children}</div>

      {footer && (
        <div className="border-border border-t px-7 py-4">
          <div className="text-muted-foreground flex flex-col gap-1.5 text-center text-[13px]">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
