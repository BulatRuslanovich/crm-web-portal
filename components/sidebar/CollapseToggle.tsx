import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
      className={cn(
        'absolute top-16 -right-3 z-10 hidden size-6 cursor-pointer items-center justify-center',
        'rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm',
        'transition-all hover:border-primary/40 hover:text-sidebar-accent-foreground md:flex',
      )}
    >
      {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  );
}
