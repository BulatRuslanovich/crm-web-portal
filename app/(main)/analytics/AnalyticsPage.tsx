'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { useUserFilter } from '@/lib/hooks/use-user-filter';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { PageTransition, StaggerList, StaggerItem } from '@/components/motion';
import { CardSkeleton } from '@/components/ui';
import { UserFilter } from '@/components/UserFilter';
import { useAnalyticsData } from '@/lib/use-analytics-data';
import { Hero } from '@/components/Hero';
import { AnalyticsSections } from '@/components/AnalyticsSections';
import { PERIODS } from '@/lib/chart-style';

const DEFAULT_PERIOD_DAYS = 30;

function PeriodButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <StaggerItem key={i}>
          <CardSkeleton />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}

function EmptyState() {
  return (
    <div className="border-border bg-card rounded-2xl border py-20 text-center">
      <p className="text-muted-foreground text-sm">Нет данных для анализа</p>
      <Link
        href="/activs/create"
        className="text-foreground mt-3 inline-block text-sm font-medium hover:underline"
      >
        Создать первый визит
      </Link>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, isDirector, isManager } = useRoles();
  const canView = isAdmin || isDirector || isManager;

  useEffect(() => {
    if (user && !canView) router.push('/dashboard');
  }, [user, canView, router]);

  const [periodDays, setPeriodDays] = useState(DEFAULT_PERIOD_DAYS);
  const [filterUsrId, setFilterUsrId] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canView);
  const usrIdParam = filterUsrId ? Number(filterUsrId) : undefined;

  const { activs, loading } = useAnalyticsData({
    enabled: canView,
    periodDays,
    usrId: usrIdParam,
  });

  if (!canView) return null;

  return (
    <PageTransition className="space-y-6">
      <Hero
        icon={TrendingUp}
        kicker="Аналитика"
        title="Динамика визитов"
        subtitle={
          !loading && (
            <>
              {activs.length} визитов за последние {periodDays} дн.
            </>
          )
        }
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            {PERIODS.map((p) => (
              <PeriodButton
                key={p.value}
                label={p.label}
                active={periodDays === p.value}
                onClick={() => setPeriodDays(p.value)}
              />
            ))}
          </div>
        }
      />

      {canView && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={filterUsrId}
          onChange={setFilterUsrId}
          currentUsrId={user?.usrId}
        />
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : activs.length === 0 ? (
        <EmptyState />
      ) : (
        <AnalyticsSections activs={activs} periodDays={periodDays} />
      )}
    </PageTransition>
  );
}
