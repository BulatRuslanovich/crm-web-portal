import { cn } from '@/lib/utils';
import type { NavGroup } from './nav-config';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarThemeSwitch } from './SidebarThemeSwitch';
import { SidebarUser } from './SidebarUser';

interface SidebarContentProps {
  compact: boolean;
  groups: NavGroup[];
  displayName: string;
  initials: string;
  role: string;
  theme: string | undefined;
  onTheme: (t: string) => void;
  onNavigate: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export function SidebarContent({
  compact,
  groups,
  displayName,
  initials,
  role,
  theme,
  onTheme,
  onNavigate,
  onProfile,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      <SidebarHeader compact={compact} onNavigate={onNavigate} />

      <SidebarNav groups={groups} compact={compact} onNavigate={onNavigate} />

      <div
        className={cn(
          'shrink-0 space-y-2 border-t border-sidebar-border',
          compact ? 'px-2 py-3' : 'px-3 py-3',
        )}
      >
        <SidebarThemeSwitch theme={theme} onChange={onTheme} compact={compact} />
        <SidebarUser
          compact={compact}
          initials={initials}
          displayName={displayName}
          role={role}
          onProfile={onProfile}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
