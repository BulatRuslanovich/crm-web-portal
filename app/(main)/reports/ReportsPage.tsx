'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/use-roles';
import { useUserFilter } from '@/lib/use-user-filter';
import { usePickerUsers } from '@/lib/use-picker-users';
import { STATUS_CLOSED } from '@/lib/api/statuses';
import { PageTransition } from '@/components/motion';
import { ListSkeleton } from '@/components/ui';
import { UserFilter } from '@/components/UserFilter';
import {
  defaultRange,
  matchPreset,
  rangeForPreset,
} from './_lib/date-range';
import { exportCsv, exportXlsx } from './_lib/export';
import { useReportsData } from './_lib/use-reports-data';
import { ReportsHero } from './_components/ReportsHero';
import { StatPills, type ReportStats } from './_components/StatPills';
import { FiltersCard } from './_components/FiltersCard';
import { PreviewTable } from './_components/PreviewTable';
import type { ActivResponse } from '@/lib/api/types';

function computeStats(activs: ActivResponse[]): ReportStats {
  const total = activs.length;
  const closed = activs.filter((a) => a.statusId === STATUS_CLOSED).length;
  const closedPct = total > 0 ? Math.round((closed / total) * 100) : 0;
  const uniqueUsers = new Set(activs.map((a) => a.usrId)).size;
  return { total, closed, closedPct, uniqueUsers };
}

function EmptyState({
  hasAnyResults,
  hasActiveFilters,
  onReset,
}: {
  hasAnyResults: boolean;
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card py-20 text-center">
      <FileSpreadsheet size={28} className="mx-auto mb-2 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        {hasAnyResults
          ? 'Ничего не найдено по выбранным фильтрам'
          : 'Нет визитов за выбранный период'}
      </p>
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="mt-3 inline-block cursor-pointer text-sm font-medium text-primary hover:underline"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, isDirector, isManager } = useRoles();
  const canView = isAdmin || isDirector || isManager;

  useEffect(() => {
    if (user && !canView) router.push('/dashboard');
  }, [user, canView, router]);

  const initial = defaultRange();
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [usrFilter, setUsrFilter] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canView);
  const usrIdParam = usrFilter ? Number(usrFilter) : undefined;

  const { data: activs, loading } = useReportsData({
    enabled: canView,
    dateFrom, dateTo, statusFilter, usrId: usrIdParam,
  });
  const filtered = activs ?? [];

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const activePresetKey = useMemo(() => matchPreset(dateFrom, dateTo), [dateFrom, dateTo]);
  const hasCustomFilter =
    statusFilter.length > 0 || usrFilter !== '' || !activePresetKey;

  function applyPreset(days: number) {
    const r = rangeForPreset(days);
    setDateFrom(r.from);
    setDateTo(r.to);
  }

  function toggleStatus(id: number) {
    setStatusFilter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleExportCsv() {
    exportCsv(filtered, `visity_${dateFrom || 'all'}_${dateTo || 'all'}.csv`);
  }

  function handleExportXlsx() {
    exportXlsx(filtered, `visity_${dateFrom || 'all'}_${dateTo || 'all'}.xlsx`);
  }

  function resetAll() {
    const r = defaultRange();
    setDateFrom(r.from);
    setDateTo(r.to);
    setStatusFilter([]);
    setUsrFilter('');
  }

  if (!canView) return null;

  return (
    <PageTransition className="mx-auto w-full space-y-4">
      <ReportsHero
        loading={loading}
        totalCount={activs ? activs.length : null}
        filteredCount={filtered.length}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onExportXlsx={handleExportXlsx}
        onExportCsv={handleExportCsv}
      />

      {!loading && filtered.length > 0 && (
        <StatPills stats={stats} filteredCount={filtered.length} />
      )}

      {canView && pickerUsers.length > 0 && (
        <UserFilter
          users={pickerUsers}
          value={usrFilter}
          onChange={setUsrFilter}
          currentUsrId={user?.usrId}
        />
      )}

      <FiltersCard
        dateFrom={dateFrom}
        dateTo={dateTo}
        activePresetKey={activePresetKey}
        statusFilter={statusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApplyPreset={applyPreset}
        onToggleStatus={toggleStatus}
        onReset={resetAll}
        showReset={hasCustomFilter}
      />

      {loading ? (
        <ListSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          hasAnyResults={Boolean(activs && activs.length > 0)}
          hasActiveFilters={statusFilter.length > 0 || Boolean(usrFilter)}
          onReset={resetAll}
        />
      ) : (
        <PreviewTable activs={filtered} />
      )}
    </PageTransition>
  );
}
