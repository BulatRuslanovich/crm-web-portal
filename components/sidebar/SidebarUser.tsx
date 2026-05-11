import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-8' : 'size-9';
  const text = size === 'sm' ? 'text-xs' : 'text-[13px]';
  return (
    <span
      className={cn(
        'border-sidebar-border text-sidebar-foreground bg-sidebar flex shrink-0 items-center justify-center rounded-full border font-medium tracking-tight',
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
        className="hover:bg-sidebar-accent/60 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors"
      >
        <Avatar initials={initials} size="sm" />
      </button>
      <button
        type="button"
        onClick={onLogout}
        title="Выйти"
        className="text-destructive hover:bg-destructive/10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors"
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
    <div className="space-y-1">
      <button
        type="button"
        onClick={onProfile}
        className="hover:bg-sidebar-accent/40 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors"
      >
        <Avatar initials={initials} />
        <div className="min-w-0 flex-1">
          <p className="text-sidebar-foreground truncate text-[13px] font-medium tracking-tight">
            {displayName}
          </p>
          <p className="text-muted-foreground/70 truncate text-[10px] font-medium tracking-[0.12em] uppercase">
            {role}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
      >
        <LogOut size={14} strokeWidth={1.5} />
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
