import { Calendar, SlidersHorizontal, X } from 'lucide-react';
import { STATUSES, STATUS_HEX } from '@/lib/api/statuses';
import { PRESETS } from '../_lib/date-range';
import React from 'react';

const DEFAULT_COLOR = '#94a3b8';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function PresetButtons({
  activeKey,
  onApply,
}: {
  activeKey: string;
  onApply: (days: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => onApply(p.days)}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            activeKey === p.key
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        <Calendar size={10} />
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-xl border border-border bg-background px-3 text-sm text-foreground transition-all focus:border-ring focus:ring-2 focus:ring-ring/40 focus:outline-none"
      />
    </div>
  );
}

function StatusChip({
  id,
  name,
  active,
  onToggle,
}: {
  id: number;
  name: string;
  active: boolean;
  onToggle: (id: number) => void;
}) {
  const color = STATUS_HEX[name.toLowerCase()] ?? DEFAULT_COLOR;
  return (
    <button
      onClick={() => onToggle(id)}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        active
          ? 'text-white shadow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
      }`}
      style={active ? { background: color, borderColor: color } : undefined}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: active ? 'rgba(255,255,255,0.9)' : color }}
      />
      {name}
    </button>
  );
}

export function FiltersCard({
  dateFrom,
  dateTo,
  activePresetKey,
  statusFilter,
  onDateFromChange,
  onDateToChange,
  onApplyPreset,
  onToggleStatus,
  onReset,
  showReset,
}: {
  dateFrom: string;
  dateTo: string;
  activePresetKey: string;
  statusFilter: number[];
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onApplyPreset: (days: number) => void;
  onToggleStatus: (id: number) => void;
  onReset: () => void;
  showReset: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-muted-foreground" />
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Фильтры
          </p>
        </div>
        {showReset && (
          <button
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <X size={12} />
            Сбросить
          </button>
        )}
      </div>

      <div className="mb-4">
        <SectionLabel>Период</SectionLabel>
        <PresetButtons activeKey={activePresetKey} onApply={onApplyPreset} />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <DateInput label="С даты" value={dateFrom} onChange={onDateFromChange} />
        <DateInput label="По дату" value={dateTo} onChange={onDateToChange} />
      </div>

      <div>
        <SectionLabel>
          Статус {statusFilter.length > 0 && `· выбрано ${statusFilter.length}`}
        </SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <StatusChip
              key={s.statusId}
              id={s.statusId}
              name={s.statusName}
              active={statusFilter.includes(s.statusId)}
              onToggle={onToggleStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
