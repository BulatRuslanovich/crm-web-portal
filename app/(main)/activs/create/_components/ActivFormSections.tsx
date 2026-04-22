'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Clock, FileText, Pill } from 'lucide-react';
import { Label, SectionLabel, Textarea } from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';
import { searchDrugOptions } from '@/lib/api/drugs';

export function TimeSection<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <div>
      <SectionLabel icon={Clock}>Время</SectionLabel>
      <Label>Дата начала</Label>
      <Controller
        name={'start' as Path<T>}
        control={control}
        render={({ field }) => (
          <DateTimePicker
            value={field.value as string}
            onChange={field.onChange}
            placeholder="Выберите дату и время"
          />
        )}
      />
    </div>
  );
}

export function DescriptionSection<T extends FieldValues>({
  register,
}: {
  register: UseFormRegister<T>;
}) {
  return (
    <div>
      <SectionLabel icon={FileText}>Описание</SectionLabel>
      <Textarea
        rows={3}
        placeholder="Описание визита..."
        {...register('description' as Path<T>)}
      />
    </div>
  );
}

interface DrugsProps<T extends FieldValues> {
  control: Control<T>;
  selected: MultiComboboxOption[];
  onSelectedChange: (opts: MultiComboboxOption[]) => void;
}

export function DrugsSection<T extends FieldValues>({
  control,
  selected,
  onSelectedChange,
}: DrugsProps<T>) {
  return (
    <div>
      <SectionLabel icon={Pill}>Препараты</SectionLabel>
      <Controller
        name={'drugIds' as Path<T>}
        control={control}
        render={({ field }) => (
          <MultiCombobox
            asyncSearch={searchDrugOptions}
            selectedOptions={selected}
            value={(field.value ?? []) as string[]}
            onChange={(vals, opts) => {
              field.onChange(vals);
              if (opts) onSelectedChange(opts);
            }}
            placeholder="Выберите препараты"
            searchPlaceholder="Поиск препарата..."
          />
        )}
      />
    </div>
  );
}
