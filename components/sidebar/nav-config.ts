import {
  Building2,
  CalendarCheck,
  CalendarDays,
  FileDown,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const MAIN_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/activs', label: 'Визиты', icon: CalendarCheck },
  { href: '/calendar', label: 'Календарь', icon: CalendarDays },
  { href: '/orgs', label: 'Организации', icon: Building2 },
  { href: '/map', label: 'Карта', icon: MapPin },
  { href: '/physes', label: 'Врачи', icon: Stethoscope },
];

export const MANAGER_NAV: NavItem[] = [
  { href: '/analytics', label: 'Аналитика', icon: TrendingUp },
  { href: '/reports', label: 'Отчёты', icon: FileDown },
];

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Администрирование', icon: ShieldCheck },
];

export function buildNavGroups({
  canSeeReports,
  isAdmin,
}: {
  canSeeReports: boolean;
  isAdmin: boolean;
}): NavGroup[] {
  const groups: NavGroup[] = [{ label: 'Основное', items: MAIN_NAV }];
  if (canSeeReports) groups.push({ label: 'Аналитика', items: MANAGER_NAV });
  if (isAdmin) groups.push({ label: 'Система', items: ADMIN_NAV });
  return groups;
}
