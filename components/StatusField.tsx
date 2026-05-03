'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { SectionLabel } from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { STATUSES } from '@/lib/api/statuses';

export function StatusField<T extends FieldValues>({ control }: { control: Control<T> }) {
  const options = STATUSES.map((s) => ({ value: String(s.statusId), label: s.statusName }));
  return (
    <div>
      <SectionLabel>Статус</SectionLabel>
      <Controller
        name={'statusId' as Path<T>}
        control={control}
        render={({ field }) => (
          <Combobox
            options={options}
            value={field.value as string}
            onChange={field.onChange}
            placeholder="Выберите статус"
          />
        )}
      />
    </div>
  );
}
