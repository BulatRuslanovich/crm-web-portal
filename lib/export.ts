import * as XLSX from 'xlsx';
import type { ActivResponse } from '@/lib/api/types';
import { formatFull } from '@/lib/format';
import { targetKind, targetKindLabel, targetLabel } from './target';

const HEADER = [
  'ID',
  'Тип цели',
  'Цель',
  'Статус',
  'Начало',
  'Конец',
  'Сотрудник',
  'Препараты',
  'Описание',
] as const;

const COLUMN_WIDTHS = [
  { wch: 6 },
  { wch: 14 },
  { wch: 32 },
  { wch: 14 },
  { wch: 18 },
  { wch: 18 },
  { wch: 16 },
  { wch: 32 },
  { wch: 48 },
];

function escapeCsv(v: string | null | undefined): string {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toRow(a: ActivResponse): (string | number)[] {
  return [
    a.activId,
    targetKindLabel(targetKind(a)),
    targetLabel(a),
    a.statusName,
    a.start ? formatFull(a.start) : '',
    a.end ? formatFull(a.end) : '',
    a.usrLogin,
    a.drugs.map((d) => d.drugName).join('; '),
    a.description ?? '',
  ];
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(activs: ActivResponse[], filename: string): void {
  const rows = activs.map(toRow);
  const csv = [HEADER, ...rows]
    .map((row) => row.map((v) => escapeCsv(String(v ?? ''))).join(','))
    .join('\n');
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function exportXlsx(activs: ActivResponse[], filename: string): void {
  const rows = activs.map(toRow);
  const ws = XLSX.utils.aoa_to_sheet([HEADER as unknown as string[], ...rows]);
  ws['!cols'] = COLUMN_WIDTHS;
  ws['!autofilter'] = { ref: `A1:I${rows.length + 1}` };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Визиты');
  XLSX.writeFile(wb, filename);
}
