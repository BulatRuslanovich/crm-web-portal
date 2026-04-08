'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Tracks a mutable Set of ids, remembers the initial state, and computes the diff on demand.
 *
 * @param sourceIds — ids to initialize from (typically derived from loaded entity + reference list)
 */
export function useSetDiff(sourceIds: number[]) {
  const initial = useRef<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (sourceIds.length > 0) {
      const s = new Set(sourceIds);
      initial.current = new Set(s);
      setSelected(s);
    }
  }, [sourceIds]);

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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const has = useCallback((id: number) => selected.has(id), [selected]);

  /** Returns { toAdd, toRemove } — only the changes since initialization. */
  function diff() {
    const toAdd = [...selected].filter((id) => !initial.current.has(id));
    const toRemove = [...initial.current].filter((id) => !selected.has(id));
    return { toAdd, toRemove };
  }

  return { selected, has, add, remove, toggle, diff, size: selected.size } as const;
}
