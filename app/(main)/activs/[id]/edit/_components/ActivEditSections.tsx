'use client';

import { Controller } from 'react-hook-form';
import { CircleDot, Clock, FileText, Pill } from 'lucide-react';
import { Label, SectionLabel, Textarea } from '@/components/ui';
import { Combobox } from '@/components/Combobox';
import { DateTimePicker } from '@/components/DateTimePicker';
import { MultiCombobox } from '@/components/MultiCombobox';
import { searchDrugOptions } from '@/lib/api/drugs';
import { STATUSES } from '@/lib/api/statuses';
import type { useMultiPicker } from '@/lib/hooks/use-multi-picker';

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormControl = any;
type FormRegister = any;

export function StatusField({ control }: { control: FormControl }) {
  const options = STATUSES.map((s) => ({ value: String(s.statusId), label: s.statusName }));
  return (
    <div>
      <SectionLabel icon={CircleDot}>Статус</SectionLabel>
      <Controller
        name="statusId"
        control={control}
        render={({ field }) => (
          <Combobox
            options={options}
            value={field.value}
            onChange={field.onChange}
            placeholder="Выберите статус"
          />
        )}
      />
    </div>
  );
}

export function TimeFields({ control }: { control: FormControl }) {
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

function DateTimeField({
  name,
  label,
  placeholder,
  control,
}: {
  name: 'start' | 'end';
  label: string;
  placeholder: string;
  control: FormControl;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DateTimePicker value={field.value} onChange={field.onChange} placeholder={placeholder} />
        )}
      />
    </div>
  );
}

export function DescriptionField({ register }: { register: FormRegister }) {
  return (
    <div>
      <SectionLabel icon={FileText}>Описание</SectionLabel>
      <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
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
