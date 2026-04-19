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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal size={13} />
        <span>Статус:</span>
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
          className="ml-auto flex cursor-pointer items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs text-muted-foreground transition-all hover:border-destructive/30 hover:text-destructive"
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
    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${cls}`}
    >
      {label}
    </button>
  );
}
