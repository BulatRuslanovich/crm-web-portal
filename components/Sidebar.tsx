'use client';

import Link from 'next/link';
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Stethoscope,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';


const navItems = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/activs', label: 'Визиты', icon: CalendarCheck },
  { href: '/orgs', label: 'Организации', icon: Building2 },
  { href: '/physes', label: 'Врачи', icon: Stethoscope },
];

const adminItems = [{ href: '/admin', label: 'Администрирование', icon: ShieldCheck }];

const itemCls = (compact: boolean) =>
  `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer relative${compact ? ' justify-center' : ''}`;

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
  compact,
  onToggle,
  onClose,
  allItems,
  displayName,
  initials,
  themeLabel,
  ThemeIcon,
  nextTheme,
  onTheme,
  onProfile,
  onLogout,
}: NavContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={`flex h-14 shrink-0 items-center border-b border-(--border) px-3 ${compact ? 'justify-center' : 'justify-between gap-2'}`}
      >
        <Link href="/dashboard" onClick={onClose} className="flex min-w-0 items-center gap-2.5">
          <div
            className="relative flex shrink-0 items-center justify-center rounded-xl shadow-sm"
          >
              <Image src={"/icon.svg"} width={32} height={32} alt={'icon'} />
          </div>
          {!compact && (
            <span className="truncate text-sm font-bold tracking-tight text-(--fg)">
              Pharmo CRM
            </span>
          )}
        </Link>

        {!compact && (
          <button
            onClick={onToggle}
            title="Свернуть"
            className="hidden h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-(--fg-muted) transition-all duration-200 hover:bg-(--surface-raised) hover:text-(--fg) md:flex"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
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
                  ? 'bg-(--primary-subtle) font-semibold text-(--primary-text) shadow-sm'
                  : 'text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg)'
              }`}
            >
              {active && (
                <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-(--primary)" />
              )}
              <Icon size={17} strokeWidth={active ? 2 : 1.75} className="shrink-0" />
              {!compact && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 space-y-1 border-t border-(--border) px-2 py-3">
        <button
          onClick={() => onTheme(nextTheme)}
          title={compact ? themeLabel : undefined}
          className={`${itemCls(compact)} text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg)`}
        >
          <ThemeIcon size={17} strokeWidth={1.75} className="shrink-0" />
          {!compact && <span className="truncate">{themeLabel}</span>}
        </button>

        <button
          onClick={onProfile}
          title={compact ? displayName : undefined}
          className={`${itemCls(compact)} text-(--fg-muted) hover:bg-(--surface-raised) hover:text-(--fg)`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--violet-text) text-xs font-semibold text-(--primary-fg) shadow-sm">
            {initials}
          </span>
          {!compact && <span className="flex-1 truncate text-left">{displayName}</span>}
        </button>

        <button
          onClick={onLogout}
          title={compact ? 'Выйти' : undefined}
          className={`${itemCls(compact)} text-(--danger-text) hover:bg-(--danger-subtle)`}
        >
          <LogOut size={17} strokeWidth={1.75} className="shrink-0" />
          {!compact && 'Выйти'}
        </button>

        {compact && (
          <button
            onClick={onToggle}
            title="Развернуть"
            className="flex w-full cursor-pointer items-center justify-center rounded-xl py-2.5 text-(--fg-muted) transition-all duration-200 hover:bg-(--surface-raised) hover:text-(--fg)"
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
    : (user?.login ?? '');
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
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  };

  return (
    <>
      <aside
        className="fixed top-0 bottom-0 left-0 z-40 hidden overflow-hidden transition-all duration-300 md:block"
        style={{ width: collapsed ? 64 : 240, ...sidebarStyle }}
      >
        <NavContent compact={collapsed} {...contentProps} />
      </aside>

      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="glass fixed top-3 left-3 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-(--border) text-(--fg-muted) shadow-sm transition-all duration-200 hover:text-(--fg) md:hidden"
      >
        {mobileOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="animate-slide-in-left fixed top-0 bottom-0 left-0 z-50 w-64 shadow-2xl md:hidden"
            style={sidebarStyle}
          >
            <NavContent compact={false} {...contentProps} />
          </aside>
        </>
      )}
    </>
  );
}
