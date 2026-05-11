'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { BtnPrimary, BtnSuccess } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { useRoles } from '@/lib/hooks/use-roles';
import { useUserFilter } from '@/lib/hooks/use-user-filter';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { STATUS_CLOSED } from '@/lib/api/statuses';
import { PageTransition } from '@/components/motion';
import { ListSkeleton } from '@/components/ui';
import { UserFilter } from '@/components/UserFilter';
import { defaultRange, matchPreset, rangeForPreset } from '@/lib/date';
import { exportCsv, exportXlsx } from '@/lib/export';
import { useReportsData } from '@/lib/use-reports-data';
import { Hero } from '@/components/Hero';
import { StatPills, type ReportStats } from '@/components/StatPills';
import { FiltersCard } from '@/components/FiltersCard';
import { PreviewTable } from '@/components/PreviewTable';
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
    <div className="border-border bg-card rounded-2xl border py-20 text-center">
      <FileSpreadsheet
        size={24}
        strokeWidth={1.5}
        className="text-muted-foreground/50 mx-auto mb-3"
      />
      <p className="text-foreground text-sm font-medium tracking-tight">
        {hasAnyResults
          ? 'Ничего не найдено по выбранным фильтрам'
          : 'Нет визитов за выбранный период'}
      </p>
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground mt-3 inline-block cursor-pointer text-xs font-medium hover:underline"
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

  const initial = useMemo(() => defaultRange(), []);
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [usrFilter, setUsrFilter] = useUserFilter();
  const { users: pickerUsers } = usePickerUsers(canView);
  const usrIdParam = usrFilter ? Number(usrFilter) : undefined;

  const {
    data: activs,
    loading,
    meta,
  } = useReportsData({
    enabled: canView,
    dateFrom,
    dateTo,
    statusFilter,
    usrId: usrIdParam,
  });
  const filtered = useMemo(() => activs ?? [], [activs]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const activePresetKey = useMemo(() => matchPreset(dateFrom, dateTo), [dateFrom, dateTo]);
  const hasCustomFilter = statusFilter.length > 0 || usrFilter !== '' || !activePresetKey;

  function applyPreset(days: number) {
    const r = rangeForPreset(days);
    setDateFrom(r.from);
    setDateTo(r.to);
  }

  function toggleStatus(id: number) {
    setStatusFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleExportCsv() {
    exportCsv(filtered, `visity_${dateFrom || 'all'}_${dateTo || 'all'}.csv`);
  }

  function handleExportXlsx() {
    void exportXlsx(filtered, `visity_${dateFrom || 'all'}_${dateTo || 'all'}.xlsx`);
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
      <Hero
        kicker="Отчёты"
        title="Экспорт визитов"
        subtitle={
          !loading &&
          activs && (
            <>
              {filtered.length}
              {meta && meta.totalCount !== filtered.length && ` из ${meta.totalCount}`} визитов ·{' '}
              {dateFrom} → {dateTo}
            </>
          )
        }
        action={
          <div className="flex shrink-0 items-center gap-2">
            <BtnSuccess onClick={handleExportXlsx} disabled={loading || filtered.length === 0}>
              <FileSpreadsheet size={15} />
              Excel
              <span className="bg-success-foreground/20 ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
                {filtered.length}
              </span>
            </BtnSuccess>
            <BtnPrimary onClick={handleExportCsv} disabled={loading || filtered.length === 0}>
              <FileDown size={15} />
              CSV
            </BtnPrimary>
          </div>
        }
      />

      {!loading && filtered.length > 0 && (
        <StatPills stats={stats} filteredCount={filtered.length} />
      )}

      {!loading && meta && meta.totalCount > 0 && (
        <p className="text-muted-foreground px-1 text-xs">
          Загружено {filtered.length} из {meta.totalCount} записей для отчёта и экспорта.
        </p>
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
