'use client';

import { Building2, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TargetKind = 'org' | 'phys';

interface Props {
  value: TargetKind;
  onChange: (next: TargetKind) => void;
}

export function TargetSwitcher({ value, onChange }: Props) {
  return (
    <div className="border-border bg-muted/50 mb-3 grid grid-cols-2 gap-2 rounded-xl border p-1">
      <SwitchButton
        icon={Building2}
        label="Организация"
        active={value === 'org'}
        onClick={() => onChange('org')}
      />
      <SwitchButton
        icon={Stethoscope}
        label="Врач"
        active={value === 'phys'}
        onClick={() => onChange('phys')}
      />
    </div>
  );
}

function SwitchButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const cls = active
    ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
    : 'text-muted-foreground hover:text-foreground';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${cls}`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
