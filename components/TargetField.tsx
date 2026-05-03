'use client';

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Label, SectionLabel } from '@/components/ui';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { searchOrgOptions } from '@/lib/api/orgs';
import { searchPhysOptions } from '@/lib/api/physes';
import { TargetSwitcher, type TargetKind } from './TargetSwitcher';

interface Props<T extends FieldValues> {
  control: Control<T>;
  targetKind: TargetKind;
  onSwitch: (kind: TargetKind) => void;
  selectedOrg: ComboboxOption | undefined;
  selectedPhys: ComboboxOption | undefined;
  onPickOrg: (o: ComboboxOption | undefined) => void;
  onPickPhys: (o: ComboboxOption | undefined) => void;
}

export function TargetField<T extends FieldValues>({
  control,
  targetKind,
  onSwitch,
  selectedOrg,
  selectedPhys,
  onPickOrg,
  onPickPhys,
}: Props<T>) {
  return (
    <div>
      <SectionLabel>Цель визита</SectionLabel>
      <TargetSwitcher value={targetKind} onChange={onSwitch} />
      {targetKind === 'org' ? (
        <TargetPicker
          name="orgId"
          label="Организация"
          control={control}
          selected={selectedOrg}
          onPick={onPickOrg}
          asyncSearch={searchOrgOptions}
          placeholder="Выберите организацию"
          searchPlaceholder="Поиск организации..."
        />
      ) : (
        <TargetPicker
          name="physId"
          label="Врач"
          control={control}
          selected={selectedPhys}
          onPick={onPickPhys}
          asyncSearch={searchPhysOptions}
          placeholder="Выберите врача"
          searchPlaceholder="Поиск врача..."
        />
      )}
    </div>
  );
}

interface PickerProps {
  name: 'orgId' | 'physId';
  label: string;
  selected: ComboboxOption | undefined;
  onPick: (o: ComboboxOption | undefined) => void;
  asyncSearch: (query: string) => Promise<ComboboxOption[]>;
  placeholder: string;
  searchPlaceholder: string;
}

function TargetPicker<T extends FieldValues>({
  name,
  label,
  control,
  selected,
  onPick,
  asyncSearch,
  placeholder,
  searchPlaceholder,
}: Omit<PickerProps, 'control'> & { control: Control<T> }) {
  return (
    <div>
      <Label required>{label}</Label>
      <Controller
        name={name as Path<T>}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Combobox
            asyncSearch={asyncSearch}
            selectedOption={selected}
            value={field.value as string}
            onChange={(val, opt) => {
              field.onChange(val);
              onPick(opt);
            }}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
          />
        )}
      />
    </div>
  );
}
