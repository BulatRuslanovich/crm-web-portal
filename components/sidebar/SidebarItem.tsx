import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavItem } from './nav-config';

const BASE_CLS =
  'group relative flex items-center gap-3 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-200';
const ACTIVE_CLS = 'bg-sidebar-accent/70 text-sidebar-accent-foreground';
const IDLE_CLS =
  'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground';

export function SidebarItem({
  item,
  active,
  compact,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  compact: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={compact ? item.label : undefined}
      className={cn(
        BASE_CLS,
        compact ? 'h-10 w-10 justify-center' : 'px-3 py-2',
        active ? ACTIVE_CLS : IDLE_CLS,
      )}
    >
      {active && !compact && (
        <span className="bg-sidebar-primary absolute top-1/2 left-0 h-4 w-[2px] -translate-y-1/2 rounded-r-full" />
      )}
      <Icon size={17} strokeWidth={active ? 2 : 1.6} className="shrink-0" />
      {!compact && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
