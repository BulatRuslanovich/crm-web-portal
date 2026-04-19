'use client';

import { useMemo, useState } from 'react';
import { useSetDiff } from '@/lib/hooks/use-set-diff';
import type { MultiComboboxOption } from '@/components/MultiCombobox';

interface SeedItem {
  id: number;
  option: MultiComboboxOption;
}

/**
 * Wires a MultiCombobox to useSetDiff: keeps selected ids, remembers initial set for diffing,
 * and merges initial-seed options with options picked from async search.
 */
export function useMultiPicker(seed: SeedItem[]) {
  const [picked, setPicked] = useState<MultiComboboxOption[]>([]);
  const diff = useSetDiff(seed.map((s) => s.id));

  const selectedOptions = useMemo<MultiComboboxOption[]>(() => {
    const pool = new Map<string, MultiComboboxOption>();
    for (const s of seed) pool.set(s.option.value, s.option);
    for (const o of picked) pool.set(o.value, o);
    return [...diff.selected]
      .map((id) => pool.get(String(id)))
      .filter((o): o is MultiComboboxOption => !!o);
  }, [seed, picked, diff.selected]);

  const selectedIds = useMemo(() => [...diff.selected].map(String), [diff.selected]);

  function handleChange(values: string[], opts?: MultiComboboxOption[]) {
    const nextIds = new Set(values.map(Number));
    for (const id of diff.selected) {
      if (!nextIds.has(id)) diff.remove(id);
    }
    for (const id of nextIds) {
      if (!diff.selected.has(id)) diff.add(id);
    }
    if (opts) setPicked(opts);
  }

  return {
    selectedOptions,
    selectedIds,
    handleChange,
    diff: () => diff.diff(),
  };
}
