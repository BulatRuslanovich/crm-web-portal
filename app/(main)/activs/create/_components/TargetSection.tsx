'use client';

import { Controller } from 'react-hook-form';
import { Target } from 'lucide-react';
import { Label, SectionLabel } from '@/components/ui';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { searchOrgOptions } from '@/lib/api/orgs';
import { searchPhysOptions } from '@/lib/api/physes';
import { TargetSwitcher, type TargetKind } from '../../_components/TargetSwitcher';

/* eslint-disable @typescript-eslint/no-explicit-any */
type FormControl = any;

interface Props {
  control: FormControl;
  targetKind: TargetKind;
  onSwitch: (kind: TargetKind) => void;
  selectedOrg: ComboboxOption | undefined;
  selectedPhys: ComboboxOption | undefined;
  onPickOrg: (o: ComboboxOption | undefined) => void;
  onPickPhys: (o: ComboboxOption | undefined) => void;
}

export function TargetSection({
  control,
  targetKind,
  onSwitch,
  selectedOrg,
  selectedPhys,
  onPickOrg,
  onPickPhys,
}: Props) {
  return (
    <div>
      <SectionLabel icon={Target}>Цель визита</SectionLabel>
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
  control: FormControl;
  selected: ComboboxOption | undefined;
  onPick: (o: ComboboxOption | undefined) => void;
  asyncSearch: (query: string) => Promise<ComboboxOption[]>;
  placeholder: string;
  searchPlaceholder: string;
}

function TargetPicker({
  name,
  label,
  control,
  selected,
  onPick,
  asyncSearch,
  placeholder,
  searchPlaceholder,
}: PickerProps) {
  return (
    <div>
      <Label required>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Combobox
            asyncSearch={asyncSearch}
            selectedOption={selected}
            value={field.value}
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
