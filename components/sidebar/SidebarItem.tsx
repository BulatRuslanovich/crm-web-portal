import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavItem } from './nav-config';

const BASE_CLS =
  'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150';
const ACTIVE_CLS =
  'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm';
const IDLE_CLS =
  'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground';

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
        <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
      )}
      <Icon
        size={18}
        strokeWidth={active ? 2.25 : 1.75}
        className="shrink-0 transition-transform group-hover:scale-110"
      />
      {!compact && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
