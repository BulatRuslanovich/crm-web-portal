'use client';

import { History } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useIsAdmin } from '@/lib/hooks/use-is-admin';
import { auditLogsApi } from '@/lib/api/audit-logs';
import { Skeleton, SectionLabel } from '@/components/ui';
import type { AuditEntityType, AuditLogResponse } from '@/lib/api/types';
import {
  ActionBadge,
  ValueCell,
} from '@/components/AuditLogItems';

interface Props {
  entityType: AuditEntityType;
  entityId: number;
}

export function EntityHistoryFeed({ entityType, entityId }: Props) {
  const isAdmin = useIsAdmin();

  const { data, loading, error } = useApi(
    isAdmin ? ['entity-history', entityType, entityId] : null,
    () => auditLogsApi.forEntity(entityType, entityId),
  );

  if (!isAdmin) return null;

  return (
    <div>
      <SectionLabel icon={History}>История изменений</SectionLabel>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">Не удалось загрузить историю</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">История пуста</p>
      ) : (
        <ul className="space-y-2">
          {data.map((row) => (
            <HistoryRow key={row.auditId} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryRow({ row }: { row: AuditLogResponse }) {
  const who = row.changedByLogin ?? (row.changedBy != null ? `#${row.changedBy}` : '—');
  const when = new Date(row.changedAt).toLocaleString('ru-RU');
  return (
    <li className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <ActionBadge action={row.action} />
        {row.fieldName && (
          <span className="font-mono text-foreground">{row.fieldName}</span>
        )}
        <span className="ml-auto tabular-nums text-muted-foreground">{when}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <span>{who}</span>
        {row.action === 'UPDATE' && (
          <span className="flex items-center gap-1.5">
            <ValueCell value={row.oldValue} />
            <span className="text-muted-foreground/60">→</span>
            <ValueCell value={row.newValue} />
          </span>
        )}
      </div>
    </li>
  );
}
