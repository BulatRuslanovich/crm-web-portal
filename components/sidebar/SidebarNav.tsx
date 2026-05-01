import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavGroup } from './nav-config';
import { SidebarItem } from './SidebarItem';

function isActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + '/')) return false;
  return !allHrefs.some(
    (h) =>
      h !== href && h.startsWith(href + '/') && (pathname === h || pathname.startsWith(h + '/')),
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <p className="text-muted-foreground/70 px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-wider uppercase">
      {label}
    </p>
  );
}

export function SidebarNav({
  groups,
  compact,
  onNavigate,
}: {
  groups: NavGroup[];
  compact: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

  return (
    <nav className={cn('flex-1 space-y-0.5 overflow-y-auto py-2', compact ? 'px-2' : 'px-3')}>
      {groups.map((group, idx) => (
        <div key={group.label} className={idx > 0 ? 'mt-2' : ''}>
          {!compact && <GroupLabel label={group.label} />}
          {compact && idx > 0 && <div className="bg-sidebar-border mx-auto my-2 h-px w-6" />}
          <div className={compact ? 'flex flex-col items-center gap-1' : 'space-y-0.5'}>
            {group.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                active={isActive(pathname, item.href, allHrefs)}
                compact={compact}
                onClick={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
