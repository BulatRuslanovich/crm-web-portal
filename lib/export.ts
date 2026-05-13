import type { ActivResponse } from '@/lib/api/types';
import { formatFull } from '@/lib/format';
import { targetKind, targetKindLabel, targetLabel } from './activ-helper';

export type ReportExportColumnId =
  | 'id'
  | 'targetType'
  | 'target'
  | 'status'
  | 'start'
  | 'end'
  | 'user'
  | 'drugs'
  | 'description';

export interface ReportExportColumn {
  id: ReportExportColumnId;
  label: string;
  width: number;
  getValue: (activ: ActivResponse) => string | number;
}

interface PdfMakeClient {
  addVirtualFileSystem?: (vfs: unknown) => void;
  vfs?: unknown;
  createPdf: (definition: unknown) => { download: (filename?: string) => void };
}

export const REPORT_EXPORT_COLUMNS: ReportExportColumn[] = [
  { id: 'id', label: 'ID', width: 6, getValue: (a) => a.activId },
  {
    id: 'targetType',
    label: 'Тип цели',
    width: 14,
    getValue: (a) => targetKindLabel(targetKind(a)),
  },
  { id: 'target', label: 'Цель', width: 32, getValue: (a) => targetLabel(a) },
  { id: 'status', label: 'Статус', width: 14, getValue: (a) => a.statusName },
  {
    id: 'start',
    label: 'Начало',
    width: 18,
    getValue: (a) => (a.start ? formatFull(a.start) : ''),
  },
  { id: 'end', label: 'Конец', width: 18, getValue: (a) => (a.end ? formatFull(a.end) : '') },
  { id: 'user', label: 'Сотрудник', width: 16, getValue: (a) => a.usrLogin },
  {
    id: 'drugs',
    label: 'Препараты',
    width: 32,
    getValue: (a) => a.drugs.map((d) => d.drugName).join('; '),
  },
  { id: 'description', label: 'Описание', width: 48, getValue: (a) => a.description ?? '' },
];

export const DEFAULT_REPORT_EXPORT_COLUMN_IDS = REPORT_EXPORT_COLUMNS.map((column) => column.id);

const COLUMN_BY_ID = new Map(REPORT_EXPORT_COLUMNS.map((column) => [column.id, column]));

function escapeCsv(v: string | null | undefined): string {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function normalizeReportExportColumnIds(ids: readonly string[]): ReportExportColumnId[] {
  const result: ReportExportColumnId[] = [];
  ids.forEach((id) => {
    if (
      COLUMN_BY_ID.has(id as ReportExportColumnId) &&
      !result.includes(id as ReportExportColumnId)
    ) {
      result.push(id as ReportExportColumnId);
    }
  });
  DEFAULT_REPORT_EXPORT_COLUMN_IDS.forEach((id) => {
    if (!result.includes(id)) result.push(id);
  });
  return result;
}

export function normalizeReportExportVisibleColumnIds(
  ids: readonly string[],
): ReportExportColumnId[] {
  const result: ReportExportColumnId[] = [];
  ids.forEach((id) => {
    if (
      COLUMN_BY_ID.has(id as ReportExportColumnId) &&
      !result.includes(id as ReportExportColumnId)
    ) {
      result.push(id as ReportExportColumnId);
    }
  });
  return result;
}

function resolveColumns(columnIds?: readonly ReportExportColumnId[]): ReportExportColumn[] {
  return normalizeReportExportVisibleColumnIds(columnIds ?? DEFAULT_REPORT_EXPORT_COLUMN_IDS)
    .map((id) => COLUMN_BY_ID.get(id))
    .filter((column): column is ReportExportColumn => Boolean(column));
}

function toRows(activs: ActivResponse[], columns?: readonly ReportExportColumnId[]) {
  const resolvedColumns = resolveColumns(columns);
  return {
    columns: resolvedColumns,
    header: resolvedColumns.map((column) => column.label),
    rows: activs.map((activ) => resolvedColumns.map((column) => column.getValue(activ))),
  };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(
  activs: ActivResponse[],
  filename: string,
  columns?: readonly ReportExportColumnId[],
): void {
  const { header, rows } = toRows(activs, columns);
  const csv = [header, ...rows]
    .map((row) => row.map((v) => escapeCsv(String(v ?? ''))).join(','))
    .join('\n');
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export async function exportXlsx(
  activs: ActivResponse[],
  filename: string,
  columns?: readonly ReportExportColumnId[],
): Promise<void> {
  const XLSX = await import('xlsx');
  const { columns: resolvedColumns, header, rows } = toRows(activs, columns);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = resolvedColumns.map((column) => ({ wch: column.width }));
  ws['!autofilter'] = {
    ref: `A1:${XLSX.utils.encode_col(resolvedColumns.length - 1)}${rows.length + 1}`,
  };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Визиты');
  XLSX.writeFile(wb, filename);
}

export async function exportPdf(
  activs: ActivResponse[],
  filename: string,
  columns?: readonly ReportExportColumnId[],
): Promise<void> {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const vfsModule = await import('pdfmake/build/vfs_fonts');
  const pdfMake = (pdfMakeModule.default ?? pdfMakeModule) as PdfMakeClient;
  const vfs = vfsModule.default ?? vfsModule;
  const { columns: resolvedColumns, header, rows } = toRows(activs, columns);
  const now = formatFull(new Date().toISOString(), '');
  const totalWidth = resolvedColumns.reduce((sum, column) => sum + column.width, 0);
  const widths = resolvedColumns.map(
    (column) => `${Math.max(5, (column.width / totalWidth) * 100)}%`,
  );

  if (pdfMake.addVirtualFileSystem) {
    pdfMake.addVirtualFileSystem(vfs);
  } else {
    pdfMake.vfs = vfs;
  }

  pdfMake
    .createPdf({
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [24, 24, 24, 28],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 8,
        color: '#111827',
      },
      styles: {
        title: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] },
        meta: { color: '#64748b', fontSize: 9, margin: [0, 0, 0, 12] },
        tableHeader: { bold: true, color: '#111827', fillColor: '#f1f5f9' },
      },
      content: [
        { text: 'Отчет по визитам', style: 'title' },
        { text: `Сформировано: ${now} · Записей: ${activs.length}`, style: 'meta' },
        {
          table: {
            headerRows: 1,
            widths,
            body: [
              header.map((cell) => ({ text: cell, style: 'tableHeader' })),
              ...rows.map((row) => row.map((cell) => String(cell ?? ''))),
            ],
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f1f5f9' : null),
            hLineColor: () => '#d7dde5',
            vLineColor: () => '#d7dde5',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },
      ],
    })
    .download(filename);
}
