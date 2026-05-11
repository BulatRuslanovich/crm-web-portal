'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { STATUSES } from '@/lib/api/statuses';

interface Props {
  value: number[];
  onChange: (next: number[]) => void;
}

export function StatusFilter({ value, onChange }: Props) {
  function toggle(statusId: number) {
    onChange(value.includes(statusId) ? value.filter((x) => x !== statusId) : [...value, statusId]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="text-muted-foreground/70 flex items-center gap-1.5 pr-1 text-[11px] font-medium tracking-[0.12em] uppercase">
        <SlidersHorizontal size={11} strokeWidth={1.5} />
        <span>Статус</span>
      </div>
      {STATUSES.map((s) => (
        <StatusChip
          key={s.statusId}
          label={s.statusName}
          active={value.includes(s.statusId)}
          onClick={() => toggle(s.statusId)}
        />
      ))}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-muted-foreground hover:border-destructive/30 hover:text-destructive ml-auto flex cursor-pointer items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs transition-all"
        >
          <X size={12} /> Сбросить
        </button>
      )}
    </div>
  );
}

function StatusChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const cls = active
    ? 'border-foreground/30 bg-foreground/[0.06] text-foreground'
    : 'border-border bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight transition-colors duration-200 ${cls}`}
    >
      {label}
    </button>
  );
}
