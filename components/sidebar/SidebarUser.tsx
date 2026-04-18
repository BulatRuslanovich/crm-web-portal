import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-8' : 'size-9';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 font-semibold text-primary-foreground shadow-sm ring-2 ring-sidebar',
        box,
        text,
      )}
    >
      {initials}
    </span>
  );
}

function CompactUser({
  initials,
  displayName,
  onProfile,
  onLogout,
}: {
  initials: string;
  displayName: string;
  onProfile: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onProfile}
        title={displayName}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent/60"
      >
        <Avatar initials={initials} size="sm" />
      </button>
      <button
        type="button"
        onClick={onLogout}
        title="Выйти"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}

function ExpandedUser({
  initials,
  displayName,
  role,
  onProfile,
  onLogout,
}: {
  initials: string;
  displayName: string;
  role: string;
  onProfile: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-2">
      <button
        type="button"
        onClick={onProfile}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent/60"
      >
        <Avatar initials={initials} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
          <p className="truncate text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            {role}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="mt-1 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut size={14} strokeWidth={2} />
        Выйти
      </button>
    </div>
  );
}

export function SidebarUser({
  compact,
  initials,
  displayName,
  role,
  onProfile,
  onLogout,
}: {
  compact: boolean;
  initials: string;
  displayName: string;
  role: string;
  onProfile: () => void;
  onLogout: () => void;
}) {
  return compact ? (
    <CompactUser
      initials={initials}
      displayName={displayName}
      onProfile={onProfile}
      onLogout={onLogout}
    />
  ) : (
    <ExpandedUser
      initials={initials}
      displayName={displayName}
      role={role}
      onProfile={onProfile}
      onLogout={onLogout}
    />
  );
}
