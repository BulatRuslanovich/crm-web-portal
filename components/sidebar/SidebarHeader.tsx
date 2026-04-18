import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function SidebarHeader({
  compact,
  onNavigate,
}: {
  compact: boolean;
  onNavigate: () => void;
}) {
  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center border-b border-sidebar-border',
        compact ? 'justify-center' : 'px-4',
      )}
    >
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex min-w-0 items-center gap-2.5"
      >
        <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
          <Image src="/icon.svg" width={24} height={24} alt="Pharmo" />
        </div>
        {!compact && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
              Pharmo CRM
            </p>
            <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Management
            </p>
          </div>
        )}
      </Link>
    </div>
  );
}
