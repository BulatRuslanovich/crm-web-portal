'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Loads a single entity by id, redirects on error.
 *
 * @param fetcher   — (id: number) => Promise<{ data: T }>
 * @param id        — string id from params
 * @param redirect  — path to redirect on fetch error
 * @param onLoad    — optional callback when data arrives (e.g. to populate form state)
 */
export function useEntity<T>(
  fetcher: (id: number) => Promise<{ data: T }>,
  id: string,
  redirect: string,
  onLoad?: (data: T) => void,
) {
  const router = useRouter();
  const numId = Number(id);
  const [data, setData] = useState<T | null>(null);
  const onLoadRef = useRef(onLoad);

  useEffect(() => {
    onLoadRef.current = onLoad;
  });

  useEffect(() => {
    let cancelled = false;
    fetcher(numId)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        onLoadRef.current?.(res.data);
      })
      .catch(() => {
        if (!cancelled) router.push(redirect);
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, numId, redirect, router]);

  const reload = useCallback(async () => {
    try {
      const res = await fetcher(numId);
      setData(res.data);
      onLoadRef.current?.(res.data);
    } catch {
      router.push(redirect);
    }
  }, [fetcher, numId, redirect, router]);

  return { data, numId, reload } as const;
}
