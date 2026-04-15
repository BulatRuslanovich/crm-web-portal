'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/use-api';
import { activsApi } from '@/lib/api/activs';
import { STATUSES } from '@/lib/api/statuses';
import { PageTransition } from '@/components/motion';
import { StatusBadge, ListSkeleton, BtnPrimary } from '@/components/ui';
import { formatShort, formatFull } from '@/lib/format';
import { FileDown, SlidersHorizontal } from 'lucide-react';
import type { ActivResponse } from '@/lib/api/types';

function escapeCsv(v: string | null | undefined): string {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportCsv(activs: ActivResponse[], filename: string) {
  const header = ['ID', 'Организация', 'Статус', 'Начало', 'Конец', 'Сотрудник', 'Препараты', 'Описание'];
  const rows = activs.map((a) => [
    a.activId,
    a.orgName,
    a.statusName,
    a.start ? formatFull(a.start) : '',
    a.end ? formatFull(a.end) : '',
    a.usrLogin,
    a.drugs.map((d) => d.drugName).join('; '),
    a.description,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((v) => escapeCsv(String(v ?? ''))).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


function toIso(date: string, endOfDay = false): string | undefined {
  if (!date) return undefined;
  const d = new Date(date + (endOfDay ? 'T23:59:59' : 'T00:00:00'));
  return d.toISOString();
}

function defaultRange(): { from: string; to: string } {
  const today = new Date();
  const past = new Date();
  past.setDate(past.getDate() - 29);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { from: fmt(past), to: fmt(today) };
}

function PreviewTable({ activs }: { activs: ActivResponse[] }) {
  const shown = activs.slice(0, 50);
  return (
    <div
      className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
      style={{ boxShadow: 'var(--shadow-sm)', backgroundImage: 'var(--gradient-card)' }}
    >
      <div className="border-b border-(--border) px-5 py-3.5">
        <p className="text-sm font-bold text-(--fg)">
          Предпросмотр
          {activs.length > 50 && (
            <span className="ml-2 text-xs font-normal text-(--fg-muted)">
              (показаны первые 50 из {activs.length})
            </span>
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-(--border) bg-(--surface-raised)/50">
              <th className="px-4 py-2.5 text-left font-semibold text-(--fg-muted)">Организация</th>
              <th className="px-4 py-2.5 text-left font-semibold text-(--fg-muted)">Статус</th>
              <th className="px-4 py-2.5 text-left font-semibold text-(--fg-muted)">Начало</th>
              <th className="px-4 py-2.5 text-left font-semibold text-(--fg-muted)">Сотрудник</th>
              <th className="px-4 py-2.5 text-left font-semibold text-(--fg-muted)">Препараты</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a, i) => (
              <tr
                key={a.activId}
                className={`transition-colors hover:bg-(--surface-raised) ${i > 0 ? 'border-t border-(--border)' : ''}`}
              >
                <td className="px-4 py-2.5">
                  <Link
                    href={`/activs/${a.activId}`}
                    className="font-medium text-(--fg) hover:text-(--primary-text)"
                  >
                    {a.orgName}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge name={a.statusName} />
                </td>
                <td className="px-4 py-2.5 text-(--fg-muted)">{formatShort(a.start)}</td>
                <td className="px-4 py-2.5 text-(--fg-muted)">{a.usrLogin}</td>
                <td className="px-4 py-2.5 text-(--fg-muted)">
                  {a.drugs.length > 0
                    ? a.drugs.map((d) => d.drugName).join(', ')
                    : <span className="text-(--fg-subtle)">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const initial = defaultRange();
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);
  const [statusFilter, setStatusFilter] = useState<number[]>([]);
  const [usrFilter, setUsrFilter] = useState('');

  const { data: activs, loading } = useApi(
    ['reports-activs', dateFrom, dateTo, statusFilter],
    () =>
      activsApi
        .getAll(
          1,
          undefined,
          undefined,
          'start',
          false,
          statusFilter.length > 0 ? statusFilter : undefined,
          toIso(dateFrom, false),
          toIso(dateTo, true),
        )
        .then((r) => r.data.items),
    { keepPreviousData: true },
  );

  const filtered = useMemo(() => {
    if (!activs) return [];
    if (!usrFilter) return activs;
    const q = usrFilter.toLowerCase();
    return activs.filter((a) => a.usrLogin.toLowerCase().includes(q));
  }, [activs, usrFilter]);

  function toggleStatus(id: number) {
    setStatusFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleExport() {
    const from = dateFrom || 'all';
    const to = dateTo || 'all';
    const filename = `visity_${from}_${to}.csv`;
    exportCsv(filtered, filename);
  }

  const hasFilter = dateFrom || dateTo || statusFilter.length > 0 || usrFilter;

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-subtle)">
            <FileDown size={18} className="text-(--primary-text)" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fg)">Отчёты</h2>
            {!loading && activs && (
              <p className="text-xs text-(--fg-muted)">
                {hasFilter ? `${filtered.length} из ${activs.length}` : activs.length} визит(ов)
              </p>
            )}
          </div>
        </div>
        <BtnPrimary onClick={handleExport} disabled={loading || filtered.length === 0}>
          <FileDown size={15} />
          Скачать CSV ({filtered.length})
        </BtnPrimary>
      </div>

      <div
        className="space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-4"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <p className="text-xs font-semibold text-(--fg-muted) uppercase tracking-wider">Фильтры</p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-(--fg-muted)">С</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-xl border border-(--border) bg-(--input-bg) px-3 text-sm text-(--fg) transition-all focus:border-(--ring) focus:outline-none focus:ring-2 focus:ring-(--ring)/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-(--fg-muted)">По</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-xl border border-(--border) bg-(--input-bg) px-3 text-sm text-(--fg) transition-all focus:border-(--ring) focus:outline-none focus:ring-2 focus:ring-(--ring)/40"
            />
          </div>

          <input
            type="text"
            placeholder="Сотрудник..."
            value={usrFilter}
            onChange={(e) => setUsrFilter(e.target.value)}
            className="h-9 rounded-xl border border-(--border) bg-(--input-bg) px-3.5 text-sm text-(--fg) placeholder:text-(--fg-subtle) transition-all focus:border-(--ring) focus:outline-none focus:ring-2 focus:ring-(--ring)/40"
          />

          <button
            onClick={() => {
              const r = defaultRange();
              setDateFrom(r.from);
              setDateTo(r.to);
              setStatusFilter([]);
              setUsrFilter('');
            }}
            className="cursor-pointer text-xs text-(--fg-muted) transition-colors hover:text-(--danger-text)"
          >
            Сбросить всё
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={13} className="text-(--fg-subtle)" />
          {STATUSES.map((s) => {
            const active = statusFilter.includes(s.statusId);
            return (
              <button
                key={s.statusId}
                onClick={() => toggleStatus(s.statusId)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'border-(--primary) bg-(--primary) text-(--primary-fg) shadow-sm'
                    : 'border-(--border) bg-(--surface) text-(--fg-muted) hover:border-(--primary-border) hover:text-(--fg)'
                }`}
              >
                {s.statusName}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-(--border) bg-(--surface) py-20 text-center">
          <p className="text-sm text-(--fg-muted)">
            {hasFilter ? 'Ничего не найдено по выбранным фильтрам' : 'Нет визитов для экспорта'}
          </p>
        </div>
      ) : (
        <PreviewTable activs={filtered} />
      )}
    </PageTransition>
  );
}
