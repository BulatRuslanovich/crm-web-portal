'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronLeft, ChevronRight, History, RotateCw, Search, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { useRoles } from '@/lib/hooks/use-roles';
import { usePickerUsers } from '@/lib/hooks/use-picker-users';
import { auditLogsApi, type AuditLogQuery } from '@/lib/api/audit-logs';
import { PageTransition } from '@/components/motion';
import { BtnPrimary, BtnSecondary, Input, Skeleton, Label } from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { DateTimePicker } from '@/components/DateTimePicker';
import type { AuditAction, AuditEntityType, AuditLogResponse } from '@/lib/api/types';
import { ActionBadge, EntityLink, ValueCell } from '@/components/AuditLogItems';
import { Hero } from '@/components/Hero';

const PAGE_SIZE_OPTIONS = [50, 100, 200];

interface FiltersState {
  entityType: AuditEntityType | '';
  entityId: string;
  action: AuditAction | '';
  changedBy: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: FiltersState = {
  entityType: '',
  entityId: '',
  action: '',
  changedBy: '',
  dateFrom: '',
  dateTo: '',
};

export default function AuditLogPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isAdmin } = useRoles();

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      router.replace('/');
    }
  }, [isLoading, user, isAdmin, router]);

  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FiltersState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const query = useMemo<AuditLogQuery>(
    () => ({
      entityType: applied.entityType || undefined,
      entityId: applied.entityId ? Number(applied.entityId) : undefined,
      action: applied.action || undefined,
      changedBy: applied.changedBy ? Number(applied.changedBy) : undefined,
      dateFrom: applied.dateFrom ? new Date(applied.dateFrom).toISOString() : undefined,
      dateTo: applied.dateTo ? new Date(applied.dateTo).toISOString() : undefined,
      page,
      pageSize,
      includeTotal: true,
    }),
    [applied, page, pageSize],
  );

  const { users } = usePickerUsers(isAdmin);

  const { data, loading, reload, error } = useApi(isAdmin ? ['audit-logs', query] : null, () =>
    auditLogsApi.search(query).then((r) => r.data),
  );

  function applyFilters() {
    setApplied(filters);
    setPage(1);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  if (!isAdmin) return null;

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PageTransition className="mx-auto w-full space-y-5">
      <Hero
        kicker="Безопасность"
        title="Аудит-лог"
        subtitle="Кто, когда и какое поле изменил"
        tone="warning"
      />

      <FiltersPanel
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        users={users}
      />

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onReload={reload}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <TableSkeleton />
      ) : data && data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <AuditTable items={data?.items ?? []} />
      )}
    </PageTransition>
  );
}

function FiltersPanel({
  filters,
  onChange,
  onApply,
  onReset,
  users,
}: {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  onApply: () => void;
  onReset: () => void;
  users: { usrId: number; firstName: string; lastName: string; login: string }[];
}) {
  const userOptions = useMemo(() => {
    const arr = users.map((u) => {
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
      return {
        value: String(u.usrId),
        label: name || u.login || `#${u.usrId}`,
        sublabel: u.login || undefined,
      };
    });
    arr.sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: '', label: 'Все пользователи' }, ...arr];
  }, [users]);

  const entityOptions = [
    { value: '', label: 'Все типы' },
    { value: 'activ', label: 'Визит' },
    { value: 'org', label: 'Организация' },
    { value: 'phys', label: 'Врач' },
  ];

  const actionOptions = [
    { value: '', label: 'Все действия' },
    { value: 'INSERT', label: 'INSERT' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' },
  ];

  function set<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="border-border bg-card rounded-2xl border p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label>Тип сущности</Label>
          <Combobox
            options={entityOptions}
            value={filters.entityType}
            onChange={(v) => {
              const next = v as AuditEntityType | '';
              onChange({ ...filters, entityType: next, entityId: next ? filters.entityId : '' });
            }}
            placeholder="Все типы"
          />
        </div>
        <div>
          <Label>ID сущности</Label>
          <Input
            type="number"
            min={1}
            placeholder="Введите ID"
            value={filters.entityId}
            disabled={!filters.entityType}
            onChange={(e) => set('entityId', e.target.value)}
          />
        </div>
        <div>
          <Label>Действие</Label>
          <Combobox
            options={actionOptions}
            value={filters.action}
            onChange={(v) => set('action', v as AuditAction | '')}
            placeholder="Все действия"
          />
        </div>
        <div>
          <Label>Кто изменил</Label>
          <Combobox
            options={userOptions}
            value={filters.changedBy}
            onChange={(v) => set('changedBy', v)}
            placeholder="Все пользователи"
            searchPlaceholder="Поиск..."
          />
        </div>
        <div>
          <Label>С даты</Label>
          <DateTimePicker
            value={filters.dateFrom}
            onChange={(v) => set('dateFrom', v)}
            placeholder="Начало"
          />
        </div>
        <div>
          <Label>По дату</Label>
          <DateTimePicker
            value={filters.dateTo}
            onChange={(v) => set('dateTo', v)}
            placeholder="Конец"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <BtnSecondary onClick={onReset}>
          <X size={14} /> Сбросить
        </BtnSecondary>
        <BtnPrimary onClick={onApply}>
          <Search size={14} /> Применить
        </BtnPrimary>
      </div>
    </div>
  );
}

function PaginationBar({
  page,
  pageSize,
  total,
  totalPages,
  loading,
  onPageChange,
  onPageSizeChange,
  onReload,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onReload: () => void;
}) {
  return (
    <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 shadow-sm">
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span>
          Всего записей: <span className="text-foreground font-semibold tabular-nums">{total}</span>
        </span>
        <span className="text-muted-foreground/50">·</span>
        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50"
        >
          <RotateCw size={11} className={loading ? 'animate-spin' : ''} /> Обновить
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label className="text-muted-foreground flex items-center gap-2">
          На странице
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border-input text-foreground h-8 rounded-md border bg-transparent px-2"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-foreground px-2 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditTable({ items }: { items: AuditLogResponse[] }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            <tr>
              <Th>Дата</Th>
              <Th>Пользователь</Th>
              <Th>Сущность</Th>
              <Th>Действие</Th>
              <Th>Поле</Th>
              <Th>Было</Th>
              <Th>Стало</Th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {items.map((row) => (
              <tr key={row.auditId} className="hover:bg-muted/40">
                <Td className="text-foreground whitespace-nowrap tabular-nums">
                  {new Date(row.changedAt).toLocaleString('ru-RU')}
                </Td>
                <Td className="text-foreground whitespace-nowrap">
                  {row.changedByLogin ?? (row.changedBy != null ? `#${row.changedBy}` : '—')}
                </Td>
                <Td>
                  <EntityLink type={row.entityType} id={row.entityId} />
                </Td>
                <Td>
                  <ActionBadge action={row.action} />
                </Td>
                <Td className="text-foreground font-mono">{row.fieldName ?? '—'}</Td>
                <Td>
                  <ValueCell value={row.oldValue} />
                </Td>
                <Td>
                  <ValueCell value={row.newValue} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 text-left">{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`text-muted-foreground px-3 py-2.5 align-top ${className}`}>{children}</td>;
}

function TableSkeleton() {
  return (
    <div className="border-border bg-card space-y-2 rounded-2xl border p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-md" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-border bg-card flex flex-col items-center gap-2 rounded-2xl border px-6 py-12 text-center shadow-sm">
      <div className="bg-muted ring-border flex h-10 w-10 items-center justify-center rounded-xl ring-1">
        <History size={16} className="text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">Нет записей за выбранный период</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-col items-center gap-3 rounded-2xl border px-6 py-8 text-center shadow-sm">
      <div className="bg-destructive/10 ring-destructive/20 flex h-10 w-10 items-center justify-center rounded-xl ring-1">
        <AlertCircle size={16} className="text-destructive" />
      </div>
      <p className="text-foreground text-sm">Не удалось загрузить аудит-лог</p>
      <BtnPrimary onClick={onRetry}>
        <RotateCw size={14} /> Повторить
      </BtnPrimary>
    </div>
  );
}
