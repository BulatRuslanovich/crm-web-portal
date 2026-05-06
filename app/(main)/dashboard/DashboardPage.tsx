'use client';

import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { useUserFilter } from '@/lib/hooks/use-user-filter';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { PageTransition } from '@/components/motion';
import { UserFilter } from '@/components/UserFilter';
import { useDashboardActivs } from '@/lib/use-dashboard-data';
import { HeatmapSection } from '@/components/HeatmapSection';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isManager, isDirector, isAdmin } = useRoles();
  const canFilterByUser = isManager || isDirector || isAdmin;

  const [filterUsrId, setFilterUsrId] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canFilterByUser);
  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;

  const { data: myActivs, loading: activsLoading, meta } = useDashboardActivs(usrIdParam);
  const filteredActivs = myActivs ?? [];
  const name = user?.firstName ?? user?.login ?? '';

  return (
    <PageTransition className="space-y-6">
      <DashboardGreeting name={name} />

      {canFilterByUser && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      {!activsLoading && meta && meta.totalCount > 0 && (
        <p className="text-muted-foreground px-1 text-xs">
          Тепловая карта рассчитана по {filteredActivs.length} из {meta.totalCount} загруженных
          визитов.
        </p>
      )}

      <HeatmapSection activs={filteredActivs} loading={activsLoading} />
    </PageTransition>
  );
}

function getGreeting(hour: number): string {
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function DashboardGreeting({ name }: { name: string }) {
  const greeting = getGreeting(new Date().getHours());
  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
      <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
        {greeting}
        {name ? `, ${name}` : ''}
      </h2>
      <p className="text-muted-foreground text-xs first-letter:uppercase">{today}</p>
    </div>
  );
}
