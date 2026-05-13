'use client';

import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, RotateCcw } from 'lucide-react';
import { BtnSecondary } from '@/components/ui';
import type { ReportExportColumn, ReportExportColumnId } from '@/lib/export';

interface Props {
  columns: ReportExportColumn[];
  order: ReportExportColumnId[];
  visibleIds: ReportExportColumnId[];
  onOrderChange: (order: ReportExportColumnId[]) => void;
  onVisibleChange: (ids: ReportExportColumnId[]) => void;
  onReset: () => void;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function ReportExportColumns({
  columns,
  order,
  visibleIds,
  onOrderChange,
  onVisibleChange,
  onReset,
}: Props) {
  const columnById = new Map(columns.map((column) => [column.id, column]));
  const orderedColumns = order
    .map((id) => columnById.get(id))
    .filter((column): column is ReportExportColumn => Boolean(column));
  const visibleSet = new Set(visibleIds);
  const canExport = visibleIds.length > 0;

  function toggleColumn(id: ReportExportColumnId) {
    if (visibleSet.has(id)) {
      onVisibleChange(visibleIds.filter((current) => current !== id));
      return;
    }
    onVisibleChange(order.filter((current) => current === id || visibleSet.has(current)));
  }

  function moveColumn(id: ReportExportColumnId, direction: -1 | 1) {
    const fromIndex = order.indexOf(id);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= order.length) return;
    onOrderChange(moveItem(order, fromIndex, toIndex));
  }

  function dropColumn(sourceId: ReportExportColumnId, targetId: ReportExportColumnId) {
    const fromIndex = order.indexOf(sourceId);
    const toIndex = order.indexOf(targetId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    onOrderChange(moveItem(order, fromIndex, toIndex));
  }

  return (
    <div className="border-border bg-card rounded-2xl border">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div>
          <p className="text-foreground text-sm font-bold">Колонки выгрузки</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Перетаскивайте строки, включайте только нужные поля.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs tabular-nums">
            {visibleIds.length} / {columns.length}
          </span>
          <BtnSecondary type="button" onClick={onReset} className="h-8 px-3 text-xs">
            <RotateCcw size={13} />
            Сбросить
          </BtnSecondary>
        </div>
      </div>

      <div className="divide-border divide-y">
        {orderedColumns.map((column, index) => {
          const visible = visibleSet.has(column.id);
          return (
            <div
              key={column.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', column.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                event.preventDefault();
                dropColumn(
                  event.dataTransfer.getData('text/plain') as ReportExportColumnId,
                  column.id,
                );
              }}
              className="hover:bg-muted/40 flex items-center gap-3 px-4 py-2.5 transition-colors"
            >
              <GripVertical size={15} className="text-muted-foreground shrink-0 cursor-grab" />
              <button
                type="button"
                onClick={() => toggleColumn(column.id)}
                aria-pressed={visible}
                className="border-border hover:bg-accent flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors"
                title={visible ? 'Исключить из выгрузки' : 'Включить в выгрузку'}
              >
                {visible ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} className="text-muted-foreground" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">{column.label}</p>
                <p className="text-muted-foreground text-xs">Позиция {index + 1}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveColumn(column.id, -1)}
                  disabled={index === 0}
                  className="border-border hover:bg-accent disabled:text-muted-foreground/40 flex size-8 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed"
                  title="Поднять"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveColumn(column.id, 1)}
                  disabled={index === orderedColumns.length - 1}
                  className="border-border hover:bg-accent disabled:text-muted-foreground/40 flex size-8 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed"
                  title="Опустить"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!canExport && (
        <div className="border-border bg-destructive/5 text-destructive border-t px-5 py-3 text-xs font-medium">
          Включите хотя бы одну колонку для выгрузки.
        </div>
      )}
    </div>
  );
}
