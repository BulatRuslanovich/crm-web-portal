'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import {
  LayoutDashboard, CalendarCheck, Building2,
  Stethoscope, ShieldCheck, Sun, Moon, Monitor,
  LogOut, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Главная',       icon: LayoutDashboard },
  { href: '/activs',    label: 'Визиты',        icon: CalendarCheck   },
  { href: '/orgs',      label: 'Организации',   icon: Building2       },
  { href: '/physes',    label: 'Врачи',         icon: Stethoscope     },
];

const adminItems = [
  { href: '/admin', label: 'Администрирование', icon: ShieldCheck },
];

const itemCls = (compact: boolean) =>
  `flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer${compact ? ' justify-center' : ''}`;

interface NavContentProps {
  compact: boolean;
  onToggle: () => void;
  onClose: () => void;
  allItems: typeof navItems;
  displayName: string;
  initials: string;
  themeLabel: string;
  ThemeIcon: React.ElementType;
  nextTheme: string;
  onTheme: (t: string) => void;
  onProfile: () => void;
  onLogout: () => void;
}

function NavContent({
  compact, onToggle, onClose, allItems,
  displayName, initials,
  themeLabel, ThemeIcon, nextTheme, onTheme,
  onProfile, onLogout,
}: NavContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={`flex items-center h-14 px-3 border-b border-(--border) shrink-0 ${compact ? 'justify-center' : 'justify-between gap-2'}`}>
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-(--primary) flex items-center justify-center shadow-sm shrink-0">
            <span className="text-xs font-bold text-(--primary-fg)">P</span>
          </div>
          {!compact && <span className="text-sm font-semibold text-(--fg) truncate">Pharmo CRM</span>}
        </Link>
        {!compact && (
          <button
            onClick={onToggle}
            title="Свернуть"
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised) transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {allItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={compact ? item.label : undefined}
              className={`${itemCls(compact)} ${
                active
                  ? 'bg-(--primary-subtle) text-(--primary-text) font-medium'
                  : 'text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised)'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0" />
              {!compact && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-(--border) py-3 px-2 space-y-0.5 shrink-0">
        <button
          onClick={() => onTheme(nextTheme)}
          title={compact ? themeLabel : undefined}
          className={`${itemCls(compact)} text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised)`}
        >
          <ThemeIcon size={16} strokeWidth={1.75} className="shrink-0" />
          {!compact && <span className="truncate">{themeLabel}</span>}
        </button>

        <button
          onClick={onProfile}
          title={compact ? displayName : undefined}
          className={`${itemCls(compact)} text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised)`}
        >
          <span className="w-6 h-6 rounded-full bg-(--primary) text-(--primary-fg) text-xs font-semibold flex items-center justify-center shrink-0">
            {initials}
          </span>
          {!compact && <span className="truncate flex-1 text-left">{displayName}</span>}
        </button>

        <button
          onClick={onLogout}
          title={compact ? 'Выйти' : undefined}
          className={`${itemCls(compact)} text-(--danger-text) hover:bg-(--danger-subtle)`}
        >
          <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
          {!compact && 'Выйти'}
        </button>

        {compact && (
          <button
            onClick={onToggle}
            title="Развернуть"
            className="flex items-center justify-center w-full py-2 rounded-xl text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised) transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
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

  const isAdmin = user?.policies?.includes('Admin');
  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.login ?? '';
  const initials = (user?.firstName?.[0] ?? user?.login?.[0] ?? '?').toUpperCase();

  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const themeLabel = theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Авто';

  const contentProps = {
    allItems,
    displayName,
    initials,
    themeLabel,
    ThemeIcon,
    nextTheme,
    onToggle,
    onClose: () => setMobileOpen(false),
    onTheme: setTheme,
    onProfile: () => router.push('/profile'),
    onLogout: logout,
  };

  const sidebarStyle = {
    background: 'var(--navbar-bg)',
    borderRight: '1px solid var(--navbar-border)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-200 overflow-hidden"
        style={{ width: collapsed ? 64 : 240, ...sidebarStyle }}
      >
        <NavContent compact={collapsed} {...contentProps} />
      </aside>

      {/* Mobile: hamburger toggle */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed top-3 left-3 z-50 flex items-center justify-center w-9 h-9 rounded-xl text-(--fg-muted) hover:text-(--fg) transition-colors cursor-pointer"
        style={{ background: 'var(--navbar-bg)', border: '1px solid var(--navbar-border)' }}
      >
        {mobileOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      {/* Mobile: overlay + sidebar */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-60 animate-slide-in-left"
            style={sidebarStyle}
          >
            <NavContent compact={false} {...contentProps} />
          </aside>
        </>
      )}
    </>
  );
}
