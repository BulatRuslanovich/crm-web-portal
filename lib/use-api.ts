'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Lightweight hook that replaces the repetitive useState/useEffect/load() pattern.
 *
 * @param fetcher  — async function that returns data
 * @param deps     — re-fetch when these change (default: fetch once on mount)
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload();
  }, deps);

  return { data, loading, reload } as const;
}
