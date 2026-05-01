'use client';

import { useMemo } from 'react';
import { Combobox } from '@/components/Combobox';
import { Users } from 'lucide-react';
import type { UserResponse } from '@/lib/api/types';

export function UserFilter({
  users,
  value,
  onChange,
  currentUsrId,
  label = 'Сотрудник',
  placeholder = 'Все сотрудники',
}: {
  users: UserResponse[];
  value: string;
  onChange: (v: string) => void;
  currentUsrId?: number;
  label?: string;
  placeholder?: string;
}) {
  const options = useMemo(() => {
    const arr = users
      .map((u) => {
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        const display = name || u.login || `#${u.usrId}`;
        return {
          value: String(u.usrId),
          label: u.usrId === currentUsrId ? `${display} (вы)` : display,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: '', label: placeholder }, ...arr];
  }, [users, currentUsrId, placeholder]);

  return (
    <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-muted ring-border flex h-8 w-8 items-center justify-center rounded-lg ring-1">
          <Users size={14} className="text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          {label}
        </span>
      </div>
      <div className="min-w-[220px] flex-1 sm:max-w-xs">
        <Combobox
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          searchPlaceholder="Поиск..."
        />
      </div>
    </div>
  );
}
