'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSetDiff } from './use-set-diff';
import type { MultiComboboxOption } from '@/components/MultiCombobox';

export function useSelectedMulti<T>(
  initialItems: T[] | undefined,
  toOption: (item: T) => MultiComboboxOption,
  getId: (item: T) => number,
) {
  const setDiff = useSetDiff(initialItems ? initialItems.map(getId) : []);
  const [picked, setPicked] = useState<MultiComboboxOption[]>([]);

  const selectedOptions = useMemo<MultiComboboxOption[]>(() => {
    const pool = new Map<string, MultiComboboxOption>();
    if (initialItems) {
      for (const item of initialItems) pool.set(String(getId(item)), toOption(item));
    }
    for (const o of picked) pool.set(o.value, o);
    return [...setDiff.selected]
      .map((id) => pool.get(String(id)))
      .filter((o): o is MultiComboboxOption => !!o);
  }, [initialItems, picked, setDiff.selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = useMemo(() => [...setDiff.selected].map(String), [setDiff.selected]);

  const onChange = useCallback(
    (vals: string[], opts?: MultiComboboxOption[]) => {
      const newSet = new Set(vals.map(Number));
      for (const id of setDiff.selected) {
        if (!newSet.has(id)) setDiff.remove(id);
      }
      for (const id of newSet) {
        if (!setDiff.selected.has(id)) setDiff.add(id);
      }
      if (opts) setPicked(opts);
    },
    [setDiff],
  );

  return { values, selectedOptions, onChange, diff: setDiff.diff } as const;
}
