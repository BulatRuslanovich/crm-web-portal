'use client';

import { useState, useCallback } from 'react';

/**
 * Tracks a mutable Set of ids, remembers the initial state, and computes the diff on demand.
 *
 * @param sourceIds — ids to initialize from (typically derived from loaded entity + reference list)
 */
export function useSetDiff(sourceIds: number[]) {
  const [initialSet, setInitialSet] = useState<Set<number>>(new Set());
  const [prevSourceKey, setPrevSourceKey] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const sourceKey = sourceIds.join(',');
  if (sourceKey !== prevSourceKey && sourceIds.length > 0) {
    setPrevSourceKey(sourceKey);
    const s = new Set(sourceIds);
    setInitialSet(new Set(s));
    setSelected(s);
  }

  const add = useCallback((id: number) => {
    setSelected((prev) => new Set(prev).add(id));
  }, []);

  const remove = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const has = useCallback((id: number) => selected.has(id), [selected]);

  /** Returns { toAdd, toRemove } — only the changes since initialization. */
  function diff() {
    const toAdd = [...selected].filter((id) => !initialSet.has(id));
    const toRemove = [...initialSet].filter((id) => !selected.has(id));
    return { toAdd, toRemove };
  }

  return { selected, has, add, remove, toggle, diff, size: selected.size } as const;
}
