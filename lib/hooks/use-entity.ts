'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from './use-api';

export function useEntity<T>(
  key: unknown[],
  fetcher: () => Promise<{ data: T }>,
  redirectOnError: string,
) {
  const router = useRouter();
  const result = useApi<T>(key, () => fetcher().then((r) => r.data));

  useEffect(() => {
    if (result.error) router.push(redirectOnError);
  }, [result.error, router, redirectOnError]);

  return result;
}
