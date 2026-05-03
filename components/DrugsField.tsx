'use client';

import { SectionLabel } from '@/components/ui';
import { useMultiPicker } from '@/lib/hooks/use-multi-picker';
import { MultiCombobox } from '@/components/MultiCombobox';
import { searchDrugOptions } from '@/lib/api/drugs';

export function DrugsField({ picker }: { picker: ReturnType<typeof useMultiPicker> }) {
  return (
    <div>
      <SectionLabel>Препараты</SectionLabel>
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
