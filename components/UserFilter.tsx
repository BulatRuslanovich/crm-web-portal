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
    <div className="flex flex-wrap items-center gap-2 px-1">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
        <Users size={13} />
        {label}
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
