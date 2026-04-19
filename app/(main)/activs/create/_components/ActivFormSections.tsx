'use client';

import { Controller } from 'react-hook-form';
import { Clock, FileText, Pill } from 'lucide-react';
import { Label, SectionLabel, Textarea } from '@/components/ui';
import { DateTimePicker } from '@/components/DateTimePicker';
import { MultiCombobox, type MultiComboboxOption } from '@/components/MultiCombobox';
import { searchDrugOptions } from '@/lib/api/drugs';

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormControl = any;
type FormRegister = any;

export function TimeSection({ control }: { control: FormControl }) {
  return (
    <div>
      <SectionLabel icon={Clock}>Время</SectionLabel>
      <Label>Дата начала</Label>
      <Controller
        name="start"
        control={control}
        render={({ field }) => (
          <DateTimePicker
            value={field.value}
            onChange={field.onChange}
            placeholder="Выберите дату и время"
          />
        )}
      />
    </div>
  );
}

export function DescriptionSection({ register }: { register: FormRegister }) {
  return (
    <div>
      <SectionLabel icon={FileText}>Описание</SectionLabel>
      <Textarea rows={3} placeholder="Описание визита..." {...register('description')} />
    </div>
  );
}

interface DrugsProps {
  control: FormControl;
  selected: MultiComboboxOption[];
  onSelectedChange: (opts: MultiComboboxOption[]) => void;
}

export function DrugsSection({ control, selected, onSelectedChange }: DrugsProps) {
  return (
    <div>
      <SectionLabel icon={Pill}>Препараты</SectionLabel>
      <Controller
        name="drugIds"
        control={control}
        render={({ field }) => (
          <MultiCombobox
            asyncSearch={searchDrugOptions}
            selectedOptions={selected}
            value={field.value}
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
