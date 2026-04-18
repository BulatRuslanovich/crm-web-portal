'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { buildNavGroups } from './sidebar/nav-config';
import { SidebarContent } from './sidebar/SidebarContent';
import { CollapseToggle } from './sidebar/CollapseToggle';

const WIDTH_EXPANDED = 240;
const WIDTH_COLLAPSED = 72;

function getRoleLabel(policies: string[]): string {
  if (policies.includes('Admin')) return 'Администратор';
  if (policies.includes('Director')) return 'Директор';
  if (policies.includes('Manager')) return 'Менеджер';
  return 'Сотрудник';
}

function getDisplayName(user: { firstName?: string; lastName?: string; login?: string } | null): string {
  if (!user) return '';
  if (user.firstName) {
    return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  }
  return user.login ?? '';
}

function getInitials(user: { firstName?: string; login?: string } | null): string {
  return (user?.firstName?.[0] ?? user?.login?.[0] ?? '?').toUpperCase();
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const policies = user?.policies ?? [];
  const isAdmin = policies.includes('Admin');
  const canSeeReports =
    isAdmin || policies.includes('Director') || policies.includes('Manager');
  const groups = buildNavGroups({ canSeeReports, isAdmin });

  const contentProps = {
    groups,
    displayName: getDisplayName(user),
    initials: getInitials(user),
    role: getRoleLabel(policies),
    theme,
    onTheme: setTheme,
    onNavigate: () => setMobileOpen(false),
    onProfile: () => {
      router.push('/profile');
      setMobileOpen(false);
    },
    onLogout: logout,
  };

  return (
    <>
      <aside
        className="fixed top-0 bottom-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-300 md:block"
        style={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED }}
      >
        <SidebarContent compact={collapsed} {...contentProps} />
        <CollapseToggle collapsed={collapsed} onToggle={onToggle} />
      </aside>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-3 left-3 z-50 md:hidden"
        aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-slide-in-left fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-sidebar-border shadow-2xl md:hidden">
            <SidebarContent compact={false} {...contentProps} />
          </aside>
        </>
      )}
    </>
  );
}
