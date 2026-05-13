import {
  Building2,
  CalendarCheck,
  CalendarDays,
  FileDown,
  LayoutDashboard,
  MapPin,
  Route,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const WORK_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/activs', label: 'Визиты', icon: CalendarCheck },
  { href: '/calendar', label: 'Календарь', icon: CalendarDays },
];

const BASE_NAV: NavItem[] = [
  { href: '/orgs', label: 'Организации', icon: Building2 },
  { href: '/physes', label: 'Врачи', icon: Stethoscope },
];

const CONTROL_NAV: NavItem[] = [
  { href: '/map', label: 'Карта', icon: MapPin },
  { href: '/map/track', label: 'Трекинг', icon: Route },
];

const MANAGER_NAV: NavItem[] = [
  { href: '/analytics', label: 'Аналитика', icon: TrendingUp },
  { href: '/reports', label: 'Отчеты', icon: FileDown },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Администрирование', icon: ShieldCheck },
];

export function buildNavGroups({
  canSeeReports,
  isAdmin,
}: {
  canSeeReports: boolean;
  isAdmin: boolean;
}): NavGroup[] {
  const groups: NavGroup[] = [
    { label: 'Работа', items: WORK_NAV },
    { label: 'База', items: BASE_NAV },
    { label: 'Контроль', items: CONTROL_NAV },
  ];
  if (canSeeReports) groups.push({ label: 'Аналитика', items: MANAGER_NAV });
  if (isAdmin) groups.push({ label: 'Система', items: ADMIN_NAV });
  return groups;
}
