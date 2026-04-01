'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Building2,
  Stethoscope, ShieldCheck, Sun, Moon, Monitor,
  LogOut, User, Menu, X, ChevronDown,
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

/* ── Theme toggle ─────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const next  = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon  = theme === 'light' ? Sun   : theme === 'dark'  ? Moon    : Monitor;
  const label = theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Авто';

  return (
    <button
      onClick={() => setTheme(next)}
      title={label}
      className="flex items-center justify-center w-9 h-9 rounded-xl text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised) transition-colors cursor-pointer"
    >
      <Icon size={17} strokeWidth={1.75} />
    </button>
  );
}

/* ── User menu ────────────────────────────────────────────────────────────── */
function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.login ?? '';
  const initials = (user?.firstName?.[0] ?? user?.login?.[0] ?? '?').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-(--surface-raised) transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-full bg-(--primary) text-(--primary-fg) text-xs font-semibold flex items-center justify-center shrink-0">
          {initials}
        </span>
        <span className="hidden sm:block text-sm font-medium text-(--fg) max-w-30 truncate">
          {displayName}
        </span>
        <ChevronDown size={13} className={`text-(--fg-muted) hidden sm:block transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-(--surface) border border-(--border) rounded-xl py-1 z-50 animate-fade-in-scale" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="px-3 py-2.5 border-b border-(--border-muted) mb-1">
            <p className="text-xs font-semibold text-(--fg) truncate">{displayName}</p>
            <p className="text-xs text-(--fg-muted) truncate">{user?.login}</p>
          </div>
          <button
            onClick={() => { setOpen(false); router.push('/profile'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-(--fg) hover:bg-(--surface-raised) transition-colors cursor-pointer"
          >
            <User size={14} /> Профиль
          </button>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-(--danger-text) hover:bg-(--danger-subtle) transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Выйти
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.policies?.includes('Admin');
  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14"
        style={{ background: 'var(--navbar-bg)', borderBottom: '1px solid var(--navbar-border)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-(--primary) flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-(--primary-fg)">P</span>
            </div>
            <span className="text-sm font-semibold text-(--fg)">Pharmo CRM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {allItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-(--primary-subtle) text-(--primary-text) font-medium'
                      : 'text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised)'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle />
            <UserMenu />
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-(--fg-muted) hover:text-(--fg) hover:bg-(--surface-raised) transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-(--border) bg-(--surface) px-4 py-3 space-y-1 animate-slide-down">
            {allItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-(--primary-subtle) text-(--primary-text) font-medium'
                      : 'text-(--fg) hover:bg-(--surface-raised)'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>
      {/* Push content below navbar */}
      <div className="h-14" />
    </>
  );
}
