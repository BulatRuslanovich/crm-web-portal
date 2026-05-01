'use client';

import { Building2, CalendarDays, Stethoscope } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { useUserFilter } from '@/lib/hooks/use-user-filter';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion';
import { UserFilter } from '@/components/UserFilter';
import {
  useDashboardActivs,
  useDashboardSummary,
} from '@/lib/use-dashboard-data';
import { DashboardHero } from '@/components/DashboardHero';
import { StatCard } from '@/components/StatCard';
import { MyDay } from '@/components/MyDay';
import { HeatmapSection } from '@/components/HeatmapSection';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isManager, isDirector, isAdmin } = useRoles();
  const canFilterByUser = isManager || isDirector || isAdmin;

  const [filterUsrId, setFilterUsrId] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canFilterByUser);
  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;

  const { data: summary, loading: summaryLoading } = useDashboardSummary(usrIdParam);
  const { data: myActivs, loading: activsLoading } = useDashboardActivs(usrIdParam);
  const filteredActivs = myActivs ?? [];
  const name = user?.firstName ?? user?.login ?? '';

  return (
    <PageTransition className="space-y-6">
      <DashboardHero name={name} />

      <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard
            loading={summaryLoading}
            label="Визиты"
            value={summary?.activsCount ?? 0}
            href="/activs"
            icon={CalendarDays}
            tone="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            loading={summaryLoading}
            label="Организации"
            value={summary?.orgsCount ?? 0}
            href="/orgs"
            icon={Building2}
            tone="success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            loading={summaryLoading}
            label="Врачи"
            value={summary?.physesCount ?? 0}
            href="/physes"
            icon={Stethoscope}
            tone="warning"
          />
        </StaggerItem>
      </StaggerList>

      {canFilterByUser && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      <HeatmapSection activs={filteredActivs} loading={activsLoading} />
      <MyDay activs={filteredActivs} loading={activsLoading} />
    </PageTransition>
  );
}
