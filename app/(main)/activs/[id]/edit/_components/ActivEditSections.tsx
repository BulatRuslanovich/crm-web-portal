'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { CircleDot, Clock, FileText, Pill } from 'lucide-react';
import { Label, SectionLabel, Textarea } from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { DateTimePicker } from '@/components/DateTimePicker';
import { MultiCombobox } from '@/components/MultiCombobox';
import { searchDrugOptions } from '@/lib/api/drugs';
import { STATUSES } from '@/lib/api/statuses';
import type { useMultiPicker } from '@/lib/hooks/use-multi-picker';

export function StatusField<T extends FieldValues>({ control }: { control: Control<T> }) {
  const options = STATUSES.map((s) => ({ value: String(s.statusId), label: s.statusName }));
  return (
    <div>
      <SectionLabel icon={CircleDot}>Статус</SectionLabel>
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

export function TimeFields<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <div>
      <SectionLabel icon={Clock}>Время визита</SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateTimeField name="start" label="Начало" placeholder="Дата начала" control={control} />
        <DateTimeField name="end" label="Конец" placeholder="Дата окончания" control={control} />
      </div>
    </div>
  );
}

function DateTimeField<T extends FieldValues>({
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

export function DescriptionField<T extends FieldValues>({
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

export function DrugsField({ picker }: { picker: ReturnType<typeof useMultiPicker> }) {
  return (
    <div>
      <SectionLabel icon={Pill}>Препараты</SectionLabel>
      <MultiCombobox
        asyncSearch={searchDrugOptions}
        selectedOptions={picker.selectedOptions}
        value={picker.selectedIds}
        onChange={picker.handleChange}
        placeholder="Выберите препараты"
        searchPlaceholder="Поиск препарата..."
      />
    </div>
  );
}
