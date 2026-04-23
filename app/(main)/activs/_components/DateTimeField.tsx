'use client';

import { DateTimePicker } from '@/components/DateTimePicker';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Label } from '@/components/ui';

export function DateTimeField<T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
}: {
  name: 'start' | 'end';
  label: string;
  placeholder: string;
  control: Control<T>;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Controller
        name={name as Path<T>}
        control={control}
        render={({ field }) => (
          <DateTimePicker
            value={field.value as string}
            onChange={field.onChange}
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
}

